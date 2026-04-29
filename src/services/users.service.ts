import { dbUsers } from '../models/db';
import { User } from '../models/interfaces';
import { logger } from '../utils/logger';

export class UserService {
  static login(email: string, password?: string) {
    let tempUser = dbUsers.find(u => u.email === email);

    if (!tempUser) return { ok: false, msg: "credenciales invalidas" };
    
    if (tempUser.password !== password) {
      tempUser.intentos++;
      if (tempUser.intentos >= 3) tempUser.bloqueado = true;
      return { ok: false, msg: "credenciales invalidas" };
    }

    if (tempUser.bloqueado) return { ok: false, msg: "usuario bloqueado" };
    if (!tempUser.activo) return { ok: false, msg: "usuario inactivo" };

    // Calcular nivel
    let nivel = "bronce";
    if (tempUser.puntos >= 300) nivel = "platino";
    else if (tempUser.puntos >= 200) nivel = "oro";
    else if (tempUser.puntos >= 100) nivel = "plata";

    tempUser.nivel = nivel;
    tempUser.ultimoLogin = new Date().toISOString();
    tempUser.intentos = 0; // Resetear intentos

    const token = "tkn_" + Math.random().toString(36).substring(2, 11);
    logger.log(`Usuario logueado: ${email}`, "INFO");

    return { ok: true, msg: "login ok", session: { user: tempUser, token } };
  }

  static register(data: any) {
    const errors = [];
    if (!data.nombre || data.nombre.length < 3) errors.push("Nombre muy corto");
    if (!data.email || !data.email.includes("@")) errors.push("Email inválido");
    
    if (errors.length > 0) return { ok: false, errors };
    if (dbUsers.some(u => u.email === data.email)) return { ok: false, msg: "Email ya registrado" };

    const newUser: User = {
      ...data,
      id: Math.floor(Math.random() * 9000) + 1000,
      tipoCuenta: "cliente",
      puntos: 0,
      activo: true,
      createdAt: new Date().toISOString(),
      historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [],
      intentos: 0, bloqueado: false, ultimoLogin: null, descuento: 0
    };

    dbUsers.push(newUser);
    return { ok: true, user: newUser };
  }
}