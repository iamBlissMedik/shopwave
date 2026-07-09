import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { productIdSchema } from '../product/product.schema';
import {
  createProductSchema,
  listMineSchema,
  listSalesSchema,
  updateProductSchema,
} from './merchant.schema';
import * as merchantController from './merchant.controller';

const router = Router();

// Every merchant route requires a logged-in MERCHANT.
router.use(authenticate, authorize('MERCHANT'));

router.get('/stats', asyncHandler(merchantController.stats));
router.get('/sales', validate(listSalesSchema), asyncHandler(merchantController.listSales));

router.get('/products', validate(listMineSchema), asyncHandler(merchantController.listProducts));
router.get('/products/:id', validate(productIdSchema), asyncHandler(merchantController.getProduct));
router.post('/products', validate(createProductSchema), asyncHandler(merchantController.createProduct));
router.patch('/products/:id', validate(updateProductSchema), asyncHandler(merchantController.updateProduct));
router.delete('/products/:id', validate(productIdSchema), asyncHandler(merchantController.deleteProduct));

export default router;
