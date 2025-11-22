import { AuthService } from "@/services/AuthService";

export class AuthController {
  private service = new AuthService();

  async register(nombre_usuario: string, correo: string, contraseña: string) {
    if (!nombre_usuario || !correo || !contraseña) {
      throw new Error("Nombre de usuario, correo y contraseña son requeridos");
    }
    return await this.service.register(nombre_usuario, correo, contraseña);
  }

  async solicitarLogin(correo: string, contraseña: string) {
    if (!correo || !contraseña) {
      throw new Error("Correo y contraseña son requeridos");
    }
    return await this.service.solicitarLogin(correo, contraseña);
  }

  async confirmarLogin(correo: string, codigo: string) {
    if (!correo || !codigo) {
      throw new Error("Correo y código son requeridos");
    }
    return await this.service.confirmarLogin(correo, codigo);
  }

  async verify(correo: string, codigo: string) {
    if (!correo || !codigo) {
      throw new Error("Correo y código son requeridos");
    }
    return await this.service.verify(correo, codigo);
  }
}