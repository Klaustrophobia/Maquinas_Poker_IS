import { AppDataSource, initializeDatabase } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { Repository } from "typeorm";

export class UsuarioRepository {
  private repo: Repository<Usuario>;

  constructor() {
    this.repo = AppDataSource.getRepository(Usuario);
  }

  async findByCorreo(correo: string) {
    await initializeDatabase();
    return this.repo.findOne({ where: { correo } });
  }

  async findByUsuario(nombre_usuario: string) {
    await initializeDatabase();
    return this.repo.findOne({ where: { nombre_usuario } });
  }

  async save(usuario: Usuario) {
    await initializeDatabase();
    return this.repo.save(usuario);
  }
}
