import { AppDataSource, initializeDatabase } from "@/lib/db";
import { Maquina, EstadoMaquina } from "@/entities/Maquina";
import { Repository } from "typeorm";

export class MaquinaRepository {
  private repository: Repository<Maquina>;

  constructor() {
    this.repository = AppDataSource.getRepository(Maquina);
  }

  private async initialize() {
    await initializeDatabase();
  }

  // CREATE
  async create(maquinaData: {
    nombre: string;
    tipo: string;
    estado: EstadoMaquina;
    ubicacion: string;
    fecha_compra?: Date;
    fecha_garantia?: Date;
  }): Promise<Maquina> {
    await this.initialize();
    const maquina = this.repository.create(maquinaData);
    return await this.repository.save(maquina);
  }

  // READ ALL
  async findAll(): Promise<Maquina[]> {
    await this.initialize();
    return await this.repository.find({
      order: { id: "DESC" }
    });
  }

  // READ BY ID
  async findById(id: number): Promise<Maquina | null> {
    await this.initialize();
    return await this.repository.findOne({
      where: { id }
    });
  }

  // UPDATE
  async update(
    id: number,
    updateData: {
      nombre?: string;
      tipo?: string;
      estado?: EstadoMaquina;
      ubicacion?: string;
      fecha_compra?: Date;
      fecha_garantia?: Date;
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

  // Búsqueda por estado
  async findByEstado(estado: EstadoMaquina): Promise<Maquina[]> {
    await this.initialize();
    return await this.repository.find({
      where: { estado },
      order: { id: "DESC" }
    });
  }

  // Búsqueda por tipo
  async findByTipo(tipo: string): Promise<Maquina[]> {
    await this.initialize();
    return await this.repository.find({
      where: { tipo },
      order: { id: "DESC" }
    });
  }

  // Búsqueda por nombre
  async searchByName(nombre: string): Promise<Maquina[]> {
    await this.initialize();
    return await this.repository
      .createQueryBuilder("maquina")
      .where("maquina.nombre ILIKE :nombre", { nombre: `%${nombre}%` })
      .getMany();
  }
}