import type { Request, Response } from 'express';
import type { Role } from '@prisma/client';
import * as adminService from './admin.service';
import * as productService from '../product/product.service';

export async function listUsers(req: Request, res: Response) {
  const result = await adminService.listUsers(
    req.query as unknown as { page: number; limit: number; search?: string; role?: Role },
  );
  res.status(200).json(result);
}

export async function updateUserRole(req: Request, res: Response) {
  const user = await adminService.updateUserRole(
    req.user!.id,
    req.params.id as string,
    (req.body as { role: Role }).role,
  );
  res.status(200).json({ user });
}

export async function deleteUser(req: Request, res: Response) {
  const result = await adminService.deleteUser(req.user!.id, req.params.id as string);
  res.status(200).json(result);
}

export async function listProducts(req: Request, res: Response) {
  const result = await adminService.listAllProducts(
    req.query as unknown as { page: number; limit: number; search?: string; status?: 'active' | 'inactive' },
  );
  res.status(200).json(result);
}

/** Admins moderate any product via the shared, ownership-aware service. */
export async function updateProduct(req: Request, res: Response) {
  const product = await productService.updateProduct(
    { id: req.user!.id, role: req.user!.role },
    req.params.id as string,
    req.body,
  );
  res.status(200).json({ product });
}

export async function stats(_req: Request, res: Response) {
  const data = await adminService.getStats();
  res.status(200).json(data);
}
