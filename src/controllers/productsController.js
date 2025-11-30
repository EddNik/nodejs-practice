import { Product } from '../models/product.js';

export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};
