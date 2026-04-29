import { Request, Response } from '../utils/http.types';
import { UserService } from '../services/users.service';

export const UsersController = {
  login: (req: Request, res: Response) => {
    const email = req.body?.email;
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({ ok: false, msg: "Faltan datos" });
    }

    const result = UserService.login(email, password);
    if (!result.ok) {
      return res.status(401).json(result);
    }
    
    return res.status(200).json(result);
  },

  register: (req: Request, res: Response) => {
    const result = UserService.register(req.body || {});
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  }
};