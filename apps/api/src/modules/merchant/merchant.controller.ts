import type { Request, Response } from 'express';
import * as productService from '../product/product.service';
import * as merchantService from './merchant.service';
import type { ListMineQuery } from '../product/product.schema';

function actor(req: Request) {
  return { id: req.user!.id, role: req.user!.role };
}

// --- Products (owner-scoped via the shared product service) ---
export async function listProducts(req: Request, res: Response) {
  const result = await productService.listByMerchant(
    req.user!.id,
    req.query as unknown as ListMineQuery,
  );
  res.status(200).json(result);
}

export async function getProduct(req: Request, res: Response) {
  const product = await productService.getOwnedProduct(actor(req), req.params.id as string);
  res.status(200).json({ product });
}

export async function createProduct(req: Request, res: Response) {
  const product = await productService.createProduct(actor(req), req.body);
  res.status(201).json({ product });
}

export async function updateProduct(req: Request, res: Response) {
  const product = await productService.updateProduct(actor(req), req.params.id as string, req.body);
  res.status(200).json({ product });
}

export async function deleteProduct(req: Request, res: Response) {
  const result = await productService.deleteProduct(actor(req), req.params.id as string);
  res.status(200).json(result);
}

// --- Sales & dashboard ---
export async function listSales(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const result = await merchantService.listSales(req.user!.id, page, limit);
  res.status(200).json(result);
}

export async function stats(req: Request, res: Response) {
  const data = await merchantService.getStats(req.user!.id);
  res.status(200).json(data);
}
