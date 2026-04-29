import { Request, Response } from '../utils/http.types';
import { ProductService } from '../services/products.service';

export const ProductsController = {
  search: (req: Request, res: Response) => {
    const filters = {
      searchText: req.query?.searchText as string,
      category: req.query?.category as string,
      minPrice: Number(req.query?.minPrice) || 0,
      maxPrice: Number(req.query?.maxPrice) || Infinity
    };

    const products = ProductService.searchProducts(filters);
    return res.status(200).json({ ok: true, count: products.length, data: products });
  }
};