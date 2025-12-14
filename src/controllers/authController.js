import { User } from '../models/user.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';
import { createSession, setSessionsCookies } from '../services/auth.js';

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
