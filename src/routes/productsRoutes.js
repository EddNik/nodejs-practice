import { Router } from 'express';
import {
  getProducts,
  getProductsById,
  createProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productsController.js';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:productId', getProductsById);
router.post('/products', createProducts);
router.patch('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

export default router;
