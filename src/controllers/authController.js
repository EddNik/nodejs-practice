import { User } from '../models/user.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';
import jwt from 'jsonwebtoken';
import { createSession, setSessionsCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw createHttpError(401, 'Email or password are wrong');
  }

  const isValidPassword = await bcrypt.compare(password, existingUser.password);

  if (!isValidPassword) {
    throw createHttpError(401, 'Email or password are wrong');
  }

  await Session.deleteOne({ userId: existingUser._id });

  const newSession = await createSession(existingUser._id);

  setSessionsCookies(res, newSession);

  res.status(200).json(existingUser);
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;
  console.log(sessionId);
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  const newSession = await createSession(session.userId);
  setSessionsCookies(res, newSession);

  res.status(200).json({
    message: 'Successfully refreshed a session!',
  });
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    { sub: existingUser._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '20m' },
  );

  const link = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      html: `<p>Click <a href="${link}">here</a> to reset your password!</p>`,
    });
  } catch (error) {
    console.log(error);
    throw createHttpError(500, 'Failed to send the email');
  }

  res.status(200).json({ message: 'Password reset email sent successfully' });
};

export const resetPassword = async (req, res) => {
  const {token, password} = req.body;

  let payload;
  try {
    payload = jwt.verify (token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email});
  if (!user) {
    throw createHttpError (404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne(
    { _id: user._id },
    { password: hashedPassword}
  );

  await Session.deleteMany({ userId: user._id});

  res.status(200).json({
    message: 'Password reset successfully',
  });
};
