import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { adminLimiter } from '../../middleware/rateLimit';
import { updateProductSchema } from '../product/product.schema';
import {
  listAllProductsSchema,
  listUsersSchema,
  updateUserRoleSchema,
  userIdSchema,
} from './admin.schema';
import * as adminController from './admin.controller';

const router = Router();

// Every admin route requires a logged-in ADMIN, under the strictest rate limit.
router.use(adminLimiter, authenticate, authorize('ADMIN'));

router.get('/stats', asyncHandler(adminController.stats));

router.get('/users', validate(listUsersSchema), asyncHandler(adminController.listUsers));
router.patch(
  '/users/:id/role',
  validate(updateUserRoleSchema),
  asyncHandler(adminController.updateUserRole),
);
router.delete('/users/:id', validate(userIdSchema), asyncHandler(adminController.deleteUser));

router.get(
  '/products',
  validate(listAllProductsSchema),
  asyncHandler(adminController.listProducts),
);
router.patch(
  '/products/:id',
  validate(updateProductSchema),
  asyncHandler(adminController.updateProduct),
);

export default router;
