import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { connectMongoDB } from './db/connectMongoDB.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import authRoutes from './routes/authRoutes.js';
import productRouter from './routes/productsRoutes.js';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';

const app = express();
const PORT = process.env.PORT ?? 3030;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(authRoutes);
app.use(productRouter);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await connectMongoDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
