import { AppDataSource, initializeDatabase } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from 'uuid';


export class UsuarioRepository {
  private repository: Repository<Usuario>;

  constructor() {
    this.repository = AppDataSource.getRepository(Usuario);
  }

  private async initialize() {
    await initializeDatabase();
  }

  // CREATE
  async create(usuarioData: {
  nombre_usuario: string;
  contraseña: string;
  rol: string;
  correo: string;
  identificador_unico?: string;
  activo?: boolean;
  codigo_login?: string;
}): Promise<Usuario> {
  await this.initialize();
  
  // Generar identificador único automáticamente
  const usuarioConIdentificador = {
    ...usuarioData,
    identificador_unico: uuidv4(), // Generar UUID único
    activo: usuarioData.activo ?? true, // Valor por defecto true si no se especifica
    fecha_creacion: new Date() // Asegurar que tenga fecha de creación
  };
  
  const usuario = this.repository.create(usuarioConIdentificador);
  return await this.repository.save(usuario);
}

  // READ ALL
  async findAll(): Promise<Usuario[]> {
    await this.initialize();
    return await this.repository.find({
      order: { id: "DESC" }
    });
  }

  // READ BY ID
  async findById(id: number): Promise<Usuario | null> {
    await this.initialize();
    return await this.repository.findOne({
      where: { id }
    });
  }

  // UPDATE
  async update(
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
  ): Promise<void> {
    await this.initialize();
    await this.repository.update(id, updateData);
  }

  // DELETE
  async delete(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  // Búsqueda por nombre de usuario
  async findByUsername(nombre_usuario: string): Promise<Usuario | null> {
    await this.initialize();
    return await this.repository.findOne({
      where: { nombre_usuario }
    });
  }

  // Búsqueda por correo
  async findByEmail(correo: string): Promise<Usuario | null> {
    await this.initialize();
    return await this.repository.findOne({
      where: { correo }
    });
  }

  // Búsqueda por rol
  async findByRol(rol: string): Promise<Usuario[]> {
    await this.initialize();
    return await this.repository.find({
      where: { rol },
      order: { id: "DESC" }
    });
  }

  // Búsqueda por estado activo
  async findByActiveStatus(activo: boolean): Promise<Usuario[]> {
    await this.initialize();
    return await this.repository.find({
      where: { activo },
      order: { id: "DESC" }
    });
  }

  // Búsqueda por identificador único
  async findByIdentificadorUnico(identificador_unico: string): Promise<Usuario | null> {
    await this.initialize();
    return await this.repository.findOne({
      where: { identificador_unico }
    });
  }

  // Búsqueda por código de login
  async findByLoginCode(codigo_login: string): Promise<Usuario | null> {
    await this.initialize();
    return await this.repository.findOne({
      where: { codigo_login }
    });
  }

  // Búsqueda general por nombre de usuario o correo
  async searchByUsernameOrEmail(search: string): Promise<Usuario[]> {
    await this.initialize();
    return await this.repository
      .createQueryBuilder("usuario")
      .where("usuario.nombre_usuario ILIKE :search", { search: `%${search}%` })
      .orWhere("usuario.correo ILIKE :search", { search: `%${search}%` })
      .getMany();
  }
}