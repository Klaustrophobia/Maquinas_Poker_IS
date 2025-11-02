import { AuthService } from "@/services/AuthService";

export class AuthController {
  private service = new AuthService();

  async solicitarLogin(correo: string, contraseña: string) {
    return await this.service.solicitarLogin(correo, contraseña);
  }

  async confirmarLogin(correo: string, codigo: string) {
    return await this.service.confirmarLogin(correo, codigo);
  }
}
