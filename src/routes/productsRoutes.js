import { Router } from 'express';
import { getProducts, getProductsById } from '../controllers/productsController.js';


const router = Router();

router.get('/products', getProducts);
router.get('/products/:productsById', getProductsById);

export default router;
