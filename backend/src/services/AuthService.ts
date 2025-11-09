import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import { Usuario } from "@/entities/Usuario";
import { randomInt } from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export class AuthService {
  private usuarioRepo = new UsuarioRepository();

  async solicitarLogin(correo: string, contraseña: string) {
    const usuario = await this.usuarioRepo.findByCorreo(correo);
    if (!usuario) throw new Error("Credenciales incorrectas.");
    if (!usuario.activo) throw new Error("Cuenta desactivada.");
    if (!usuario.verificado) throw new Error("Cuenta no verificada.");

    const valid = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!valid) throw new Error("Credenciales incorrectas.");

    // 🔹 Generar código aleatorio de 6 dígitos
    const codigo = randomInt(100000, 999999).toString();
    usuario.codigo_login = codigo;

    await this.usuarioRepo.save(usuario);

    // 🔹 Enviar correo con el código
    await sendVerificationEmail(usuario.correo, codigo);

    return { message: "Código enviado al correo.", correo: usuario.correo };
  }

  async confirmarLogin(correo: string, codigo: string) {
    // Validar que existe JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error("Error de configuración: JWT_SECRET no está definido en variables de entorno");
    }

    const usuario = await this.usuarioRepo.findByCorreo(correo);
    if (!usuario) throw new Error("Usuario no encontrado.");
    if (!usuario.codigo_login) throw new Error("No hay un código de verificación pendiente.");
    if (usuario.codigo_login !== codigo) throw new Error("Código incorrecto.");

    usuario.codigo_login = null;
    await this.usuarioRepo.save(usuario);

    // 🔹 Generar token JWT (ahora sabemos que JWT_SECRET existe)
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return {
      message: "Login exitoso.",
      user: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
        rol: usuario.rol,
        identificador_unico: usuario.identificador_unico,
      },
      token,
    };
  }
}
