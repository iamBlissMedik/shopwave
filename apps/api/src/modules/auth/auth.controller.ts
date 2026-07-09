import type { CookieOptions, Request, Response } from 'express';
import { env, isProd } from '../../config/env';
import * as authService from './auth.service';
import * as cartService from '../cart/cart.service';

/**
 * If the caller built up a guest cart before authenticating, fold it into their
 * account cart and drop the guest session cookie. Only customers have carts.
 */
async function absorbGuestCart(req: Request, res: Response, user: { id: string; role: string }) {
  const sessionId = req.cookies?.[env.CART_COOKIE_NAME] as string | undefined;
  if (!sessionId || user.role !== 'USER') return;
  await cartService.mergeGuestCart(user.id, sessionId);
  res.clearCookie(env.CART_COOKIE_NAME, { path: '/', domain: env.COOKIE_DOMAIN });
}

/**
 * Cookie holding the JWT. httpOnly => not readable by JS (XSS-safe).
 * sameSite 'lax' is fine for our localhost setup; in production behind HTTPS
 * `secure` is enabled so it is only ever sent over TLS.
 */
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_EXPIRES_IN
  path: '/',
  // In prod, scope to the parent domain (e.g. `.app.com`) so the session is
  // shared across the user/merchant/admin subdomains. SameSite=Lax is correct:
  // those subdomains are the same registrable site as the API.
  domain: env.COOKIE_DOMAIN,
};

export async function register(req: Request, res: Response) {
  const { user, token } = await authService.register(req.body);
  res.cookie(env.COOKIE_NAME, token, cookieOptions);
  await absorbGuestCart(req, res, user);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { user, token } = await authService.login(req.body);
  res.cookie(env.COOKIE_NAME, token, cookieOptions);
  await absorbGuestCart(req, res, user);
  res.status(200).json({ user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  // Also drop any lingering guest-cart session cookie so logout fully resets state.
  res.clearCookie(env.CART_COOKIE_NAME, { path: '/', domain: env.COOKIE_DOMAIN });
  res.status(200).json({ message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  res.status(200).json({ user });
}
