export interface CartItem {
  prodId: number;
  cantidad: number;
  addedAt?: Date;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  tipoCuenta: string;
  puntos: number;
  descuento: number;
  historial: any[];
  carrito: CartItem[];
  wishlist: number[];
  direcciones: any[];
  metodoPago: any[];
  activo: boolean;
  intentos: number;
  bloqueado: boolean;
  ultimoLogin: string | null;
  createdAt: string;
  updatedAt?: string;
  nivel?: string;
}

export interface Product {
  id: number;
  nombreProduct: string;
  categoria: string;
  precio: number;
  stock: number;
  desc: string;
  rating: number;
  reviews: any[];
  vendedor: number;
  imgs: string[];
  tags: string[];
  activo: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  tipo: "porcentaje" | "fijo" | "envio" | string;
  valor: number;
  minCompra: number;
  maxUsos: number;
  usos: number;
  activo: boolean;
  expira: string;
  categorias: string[];
  usuarios: number[];
}