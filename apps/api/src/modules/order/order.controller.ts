import type { Request, Response } from 'express';
import * as orderService from './order.service';

export async function checkout(req: Request, res: Response) {
  // Optional idempotency key from the client (capped to a sane length).
  const raw = req.get('Idempotency-Key');
  const idempotencyKey = raw && raw.length <= 200 ? raw : undefined;
  const order = await orderService.checkout(req.user!.id, idempotencyKey);
  res.status(201).json({ order });
}

export async function list(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const result = await orderService.listOrders(req.user!.id, page, limit);
  res.status(200).json(result);
}

export async function getOne(req: Request, res: Response) {
  const order = await orderService.getOrder(req.user!.id, req.params.id as string);
  res.status(200).json({ order });
}
