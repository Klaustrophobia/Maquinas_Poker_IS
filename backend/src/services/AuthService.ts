import jwt from "jsonwebtoken";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import { randomInt } from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";
import { Usuario } from "@/entities/Usuario";

export class AuthService {
  private usuarioRepo = new UsuarioRepository();

  async register(nombre_usuario: string, correo: string, contraseña: string) {
    // Verificar si el usuario ya existe
    const usuarioExistente = await this.usuarioRepo.findByCorreo(correo);
    if (usuarioExistente) {
      throw new Error("El correo ya está registrado.");
    }

    const usuarioPorNombre = await this.usuarioRepo.findByUsuario(nombre_usuario);
    if (usuarioPorNombre) {
      throw new Error("El nombre de usuario ya está en uso.");
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario();
    nuevoUsuario.nombre_usuario = nombre_usuario;
    nuevoUsuario.correo = correo;
    nuevoUsuario.contraseña = contraseña; // En un caso real, aquí deberías hashear la contraseña
    nuevoUsuario.rol = "usuario"; // Rol por defecto
    nuevoUsuario.activo = true;

    await this.usuarioRepo.save(nuevoUsuario);

    return { 
      message: "Usuario registrado exitosamente.", 
      usuario: {
        id: nuevoUsuario.id,
        nombre_usuario: nuevoUsuario.nombre_usuario,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    };
  }

  async solicitarLogin(correo: string, contraseña: string) {
    const usuario = await this.usuarioRepo.findByCorreo(correo);
    if (!usuario) throw new Error("Credenciales incorrectas.");
    if (!usuario.activo) throw new Error("Cuenta desactivada.");

    // ✅ COMPARACIÓN DIRECTA (sin bcrypt)
    if (usuario.contraseña !== contraseña) {
      throw new Error("Credenciales incorrectas.");
    }

    // Generar código aleatorio de 6 dígitos
    const codigo = randomInt(100000, 999999).toString();
    usuario.codigo_login = codigo;

    await this.usuarioRepo.save(usuario);

    // Enviar correo con el código
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

    // Limpiar el código después de usarlo
    usuario.codigo_login = undefined;
    await this.usuarioRepo.save(usuario);

    // Generar token JWT
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

  // Método para verificación general (si necesitas uno separado)
  async verify(correo: string, codigo: string) {
    // Este método podría ser similar a confirmarLogin o tener otra lógica específica
    return await this.confirmarLogin(correo, codigo);
  }
}