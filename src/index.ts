import usersRoutes from './routes/users.routes';
import productsRoutes from './routes/products.routes';
import { Request, Response, CustomRouter } from './utils/http.types';
import { logger } from './utils/logger';

// ==========================================
// 1. MOTOR DE LA APLICACIÓN PURE TS
// ==========================================
class PureTSApp {
  private allRoutes: { method: string, path: string, handler: Function }[] = [];

  // Función que emula a app.use() de Express
  use(prefix: string, router: CustomRouter) {
    router.routes.forEach(route => {
      this.allRoutes.push({
        method: route.method,
        path: prefix + route.path,
        handler: route.handler
      });
    });
  }

  // Despachador de peticiones HTTP simuladas
  dispatch(method: string, path: string, reqData: Request) {
    logger.log(`---> [REQUEST] ${method} ${path}`, "INFO");

    const route = this.allRoutes.find(r => r.method === method && r.path === path);

    const res: Response = {
      statusCode: 200,
      status(code: number) { 
        this.statusCode = code; 
        return this; 
      },
      json(data: any) {
        logger.log(`<--- [RESPONSE ${this.statusCode}]: ${JSON.stringify(data)}\n`, "INFO");
      }
    };

    if (route) {
      route.handler(reqData, res);
    } else {
      res.status(404).json({ ok: false, msg: 'Endpoint no encontrado' });
    }
  }
}

// ==========================================
// 2. CONFIGURACIÓN DEL SISTEMA
// ==========================================
const app = new PureTSApp();

// Inyectamos las rutas
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);


// ==========================================
// 3. EJECUCIÓN DEL CÓDIGO
// ==========================================
logger.log("INICIANDO SISTEMA EN MODO PURE TYPESCRIPT...\n", "INFO");

// Prueba 1: Login correcto
app.dispatch('POST', '/api/users/login', {
  body: { email: "juan@mail.com", password: "1234" }
});

// Prueba 2: Búsqueda de productos
app.dispatch('GET', '/api/products/search', {
  query: { category: "electronica" }
});

// Prueba 3: Probar un endpoint que no existe
app.dispatch('GET', '/api/inexistente', {});