import { NextRequest, NextResponse } from "next/server";
import { UsuarioService } from "@/services/Usuario.service";

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  async getAllUsuarios(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const rol = searchParams.get("rol");
      const activo = searchParams.get("activo");
      const search = searchParams.get("search");

      if (rol === "Cliente" && activo === "true") {
        const usuarios = await this.usuarioService.getUsuariosByActiveStatus(true);
        return NextResponse.json(
        usuarios.filter(u => u.rol === "Cliente")
        );
      }

      if (rol) {
        const usuarios = await this.usuarioService.getUsuariosByRol(rol);
        return NextResponse.json(usuarios);
      } else if (activo !== null) {
        const isActive = activo === "true";
        const usuarios = await this.usuarioService.getUsuariosByActiveStatus(isActive);
        return NextResponse.json(usuarios);
      } else if (search) {
        const usuarios = await this.usuarioService.searchUsuarios(search);
        return NextResponse.json(usuarios);
      } else {
        const usuarios = await this.usuarioService.getAllUsuarios();
        return NextResponse.json(usuarios);
      }
    } catch (error) {
      console.error("Error en UsuarioController.getAllUsuarios:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async createUsuario(request: NextRequest) {
    try {
      const body = await request.json();
      const { 
        nombre_usuario, 
        contraseña, 
        rol, 
        correo, 
        activo, 
        codigo_login 
      } = body;

      if (!nombre_usuario || !contraseña || !rol || !correo) {
        return NextResponse.json(
          { error: "Nombre de usuario, contraseña, rol y correo son requeridos" },
          { status: 400 }
        );
      }

      // Verificar si el nombre de usuario ya existe
      const usuarioExistente = await this.usuarioService.getUsuarioByUsername(nombre_usuario);
      if (usuarioExistente) {
        return NextResponse.json(
          { error: "El nombre de usuario ya está en uso" },
          { status: 400 }
        );
      }

      // Verificar si el correo ya existe
      const correoExistente = await this.usuarioService.getUsuarioByEmail(correo);
      if (correoExistente) {
        return NextResponse.json(
          { error: "El correo electrónico ya está en uso" },
          { status: 400 }
        );
      }
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return NextResponse.json(
          { error: "El formato del correo electrónico no es válido" },
          { status: 400 }
        );
      }

      const usuario = await this.usuarioService.createUsuario({
        nombre_usuario,
        contraseña,
        rol,
        correo,
        // No incluir identificador_unico
        activo: activo !== undefined ? activo : true,
        codigo_login
      });

      return NextResponse.json(usuario, { status: 201 });
    } catch (error) {
      console.error("Error en UsuarioController.createUsuario:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async getUsuarioById(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
     
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const usuario = await this.usuarioService.getUsuarioById(numericId);

      if (!usuario) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(usuario);
    } catch (error) {
      console.error("Error en UsuarioController.getUsuarioById:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async updateUsuario(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
     
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { 
        nombre_usuario, 
        contraseña, 
        rol, 
        correo, 
        identificador_unico, 
        activo, 
        codigo_login 
      } = body;

      const usuarioExistente = await this.usuarioService.getUsuarioById(numericId);
      if (!usuarioExistente) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      // Verificar si el nuevo nombre de usuario ya existe (si se está actualizando)
      if (nombre_usuario && nombre_usuario !== usuarioExistente.nombre_usuario) {
        const usuarioConMismoNombre = await this.usuarioService.getUsuarioByUsername(nombre_usuario);
        if (usuarioConMismoNombre) {
          return NextResponse.json(
            { error: "El nombre de usuario ya está en uso" },
            { status: 400 }
          );
        }
      }

      // Verificar si el nuevo correo ya existe (si se está actualizando)
      if (correo && correo !== usuarioExistente.correo) {
        const usuarioConMismoCorreo = await this.usuarioService.getUsuarioByEmail(correo);
        if (usuarioConMismoCorreo) {
          return NextResponse.json(
            { error: "El correo electrónico ya está en uso" },
            { status: 400 }
          );
        }
      }

      const usuarioActualizado = await this.usuarioService.updateUsuario(numericId, {
        nombre_usuario,
        contraseña,
        rol,
        correo,
        identificador_unico,
        activo,
        codigo_login
      });

      return NextResponse.json(usuarioActualizado);
    } catch (error) {
      console.error("Error en UsuarioController.updateUsuario:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async deleteUsuario(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
     
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const usuarioExistente = await this.usuarioService.getUsuarioById(numericId);
      if (!usuarioExistente) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      const deleted = await this.usuarioService.deleteUsuario(numericId);
      return NextResponse.json({
        success: deleted,
        message: "Usuario eliminado correctamente"
      });
    } catch (error) {
      console.error("Error en UsuarioController.deleteUsuario:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }
}