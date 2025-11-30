import { Router } from 'express';
import {
  getProducts,
  getProductsById,
  createProducts,
} from '../controllers/productsController.js';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:productsById', getProductsById);
router.post('/products', createProducts);

export default router;
