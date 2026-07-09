import type { Request, Response } from 'express';
import * as productService from './product.service';
import type { ListProductsQuery } from './product.schema';

export async function list(req: Request, res: Response) {
  const result = await productService.listProducts(req.query as unknown as ListProductsQuery);
  res.status(200).json(result);
}

export async function getOne(req: Request, res: Response) {
  const product = await productService.getProductById(req.params.id as string);
  res.status(200).json({ product });
}

export async function categories(_req: Request, res: Response) {
  const categories = await productService.listCategories();
  res.status(200).json({ categories });
}
