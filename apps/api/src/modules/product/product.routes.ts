import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { listProductsSchema, productIdSchema } from './product.schema';
import * as productController from './product.controller';

const router = Router();

// Public catalogue endpoints.
router.get('/', validate(listProductsSchema), asyncHandler(productController.list));
router.get('/categories', asyncHandler(productController.categories));
router.get('/:id', validate(productIdSchema), asyncHandler(productController.getOne));

export default router;
