import { CustomRouter } from '../utils/http.types';
import { ProductsController } from '../controllers/products.controller';

const router = new CustomRouter();

router.get('/search', ProductsController.search);

export default router;