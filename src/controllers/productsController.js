import { Product } from '../models/product.js';
import createHttpError from 'http-errors';

export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

export const getProductsById = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    throw createHttpError(404, 'Product not found');
  }

  res.json(product);
};
