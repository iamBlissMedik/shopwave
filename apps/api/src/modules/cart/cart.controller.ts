import { randomUUID } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';
import { env, isProd } from '../../config/env';
import * as cartService from './cart.service';
import type { CartOwner } from './cart.service';

/** Guest-cart cookie: httpOnly, long-lived, shared across subdomains in prod. */
const guestCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
  domain: env.COOKIE_DOMAIN,
};

/**
 * Resolve whose cart this request operates on: the logged-in user, or an
 * anonymous guest. For a guest with no session cookie yet, mint one and set it
 * so subsequent requests reuse the same cart (and it can be merged on login).
 */
function cartOwner(req: Request, res: Response): CartOwner {
  if (req.user) return { userId: req.user.id };

  let sid = req.cookies?.[env.CART_COOKIE_NAME] as string | undefined;
  if (!sid) {
    sid = randomUUID();
    res.cookie(env.CART_COOKIE_NAME, sid, guestCookieOptions);
  }
  return { sessionId: sid };
}

export async function getCart(req: Request, res: Response) {
  const cart = await cartService.getCart(cartOwner(req, res));
  res.status(200).json({ cart });
}

export async function addItem(req: Request, res: Response) {
  const { productId, quantity } = req.body as { productId: string; quantity: number };
  const cart = await cartService.addToCart(cartOwner(req, res), productId, quantity);
  res.status(200).json({ cart });
}

export async function updateItem(req: Request, res: Response) {
  const cart = await cartService.updateItem(
    cartOwner(req, res),
    req.params.productId as string,
    (req.body as { quantity: number }).quantity,
  );
  res.status(200).json({ cart });
}

export async function removeItem(req: Request, res: Response) {
  const cart = await cartService.removeItem(cartOwner(req, res), req.params.productId as string);
  res.status(200).json({ cart });
}

export async function clear(req: Request, res: Response) {
  const cart = await cartService.clearCart(cartOwner(req, res));
  res.status(200).json({ cart });
}
