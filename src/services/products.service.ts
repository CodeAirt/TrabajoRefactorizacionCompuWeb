import { dbProducts } from '../models/db';
import { Product } from '../models/interfaces';

export class ProductService {
  static searchProducts(filters: { searchText?: string, category?: string, minPrice?: number, maxPrice?: number }) {
    const { searchText, category, minPrice = 0, maxPrice = Infinity } = filters;
    const search = searchText?.trim().toLowerCase();

    const result = dbProducts.filter(p => {
      if (!p.activo) return false;
      if (search && !p.nombreProduct.toLowerCase().includes(search) && !p.desc.toLowerCase().includes(search)) return false;
      if (category && p.categoria.toLowerCase() !== category.toLowerCase()) return false;
      if (p.precio < minPrice || p.precio > maxPrice) return false;
      return true;
    });

    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }
}