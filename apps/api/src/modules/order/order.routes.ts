import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { listOrdersSchema, orderIdSchema } from './order.schema';
import * as orderController from './order.controller';

const router = Router();

router.use(authenticate);

router.post('/checkout', asyncHandler(orderController.checkout));
router.get('/', validate(listOrdersSchema), asyncHandler(orderController.list));
router.get('/:id', validate(orderIdSchema), asyncHandler(orderController.getOne));

export default router;
