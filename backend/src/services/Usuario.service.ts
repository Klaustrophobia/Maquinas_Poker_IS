import { UsuarioRepository } from "@/repositories/Usuarios.repository";
import { Usuario } from "@/entities/Usuario";

export class UsuarioService {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  // CREATE
  async createUsuario(usuarioData: {
    nombre_usuario: string;
    contraseña: string;
    rol: string;
    correo: string;
    activo?: boolean;
    codigo_login?: string;
  }): Promise<Usuario> {
    return await this.usuarioRepository.create(usuarioData);
  }

  // READ ALL
  async getAllUsuarios(): Promise<Usuario[]> {
    return await this.usuarioRepository.findAll();
  }

  // READ BY ID
  async getUsuarioById(id: number): Promise<Usuario | null> {
    return await this.usuarioRepository.findById(id);
  }

  // UPDATE
  async updateUsuario(
    id: number,
    updateData: {
      nombre_usuario?: string;
      contraseña?: string;
      rol?: string;
      correo?: string;
      identificador_unico?: string;
      activo?: boolean;
      codigo_login?: string;
    }
  ): Promise<Usuario | null> {
    await this.usuarioRepository.update(id, updateData);
    return await this.usuarioRepository.findById(id);
  }

  // DELETE
  async deleteUsuario(id: number): Promise<boolean> {
    return await this.usuarioRepository.delete(id);
  }

  // Búsqueda por nombre de usuario
  async getUsuarioByUsername(nombre_usuario: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findByUsername(nombre_usuario);
  }

  // Búsqueda por correo
  async getUsuarioByEmail(correo: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findByEmail(correo);
  }

  // Búsqueda por rol
  async getUsuariosByRol(rol: string): Promise<Usuario[]> {
    return await this.usuarioRepository.findByRol(rol);
  }

  // Búsqueda por estado activo
  async getUsuariosByActiveStatus(activo: boolean): Promise<Usuario[]> {
    return await this.usuarioRepository.findByActiveStatus(activo);
  }

  // Búsqueda por identificador único
  async getUsuarioByIdentificadorUnico(identificador_unico: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findByIdentificadorUnico(identificador_unico);
  }

  // Búsqueda por código de login
  async getUsuarioByLoginCode(codigo_login: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findByLoginCode(codigo_login);
  }

  // Búsqueda general por nombre de usuario o correo
  async searchUsuarios(search: string): Promise<Usuario[]> {
    return await this.usuarioRepository.searchByUsernameOrEmail(search);
  }
}