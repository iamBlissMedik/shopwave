import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { optionalAuthenticate } from '../../middleware/auth';
import { addToCartSchema, removeCartItemSchema, updateCartItemSchema } from './cart.schema';
import * as cartController from './cart.controller';

const router = Router();

// Cart is available to guests (anonymous session cookie) AND logged-in users;
// `optionalAuthenticate` attaches the user if a token is present but never 401s.
router.use(optionalAuthenticate);

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', validate(addToCartSchema), asyncHandler(cartController.addItem));
router.patch(
  '/items/:productId',
  validate(updateCartItemSchema),
  asyncHandler(cartController.updateItem),
);
router.delete(
  '/items/:productId',
  validate(removeCartItemSchema),
  asyncHandler(cartController.removeItem),
);
router.delete('/', asyncHandler(cartController.clear));

export default router;
