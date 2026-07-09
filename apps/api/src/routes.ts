import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/product/product.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/order/order.routes';
import merchantRoutes from './modules/merchant/merchant.routes';
import adminRoutes from './modules/admin/admin.routes';

/** Mounts every feature module under /api. */
const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes); // public catalogue
router.use('/cart', cartRoutes); // customer
router.use('/orders', orderRoutes); // customer
router.use('/merchant', merchantRoutes); // MERCHANT-only dashboard
router.use('/admin', adminRoutes); // ADMIN-only console

export default router;
