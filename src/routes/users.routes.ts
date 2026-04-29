import { CustomRouter } from '../utils/http.types';
import { UsersController } from '../controllers/users.controller';

const router = new CustomRouter();

router.post('/login', UsersController.login);
router.post('/register', UsersController.register);

export default router;