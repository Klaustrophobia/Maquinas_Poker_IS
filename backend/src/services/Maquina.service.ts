import { AppDataSource, initializeDatabase } from "@/lib/db";
import { Maquina, EstadoMaquina } from "@/entities/Maquina";

export class MaquinaService {
  private maquinaRepository = AppDataSource.getRepository(Maquina);

  async initialize() {
    await initializeDatabase();
  }

  // CREATE
  async createMaquina(maquinaData: {
    nombre: string;
    tipo: string;
    estado: EstadoMaquina;
    ubicacion: string;
    fecha_compra?: Date;
    fecha_garantia?: Date;
  }): Promise<Maquina> {
    await this.initialize();
    const maquina = this.maquinaRepository.create(maquinaData);
    return await this.maquinaRepository.save(maquina);
  }

  // READ ALL
  async getAllMaquinas(): Promise<Maquina[]> {
    await this.initialize();
    return await this.maquinaRepository.find({
      order: { id: "DESC" }
    });
  }

  // READ BY ID
  async getMaquinaById(id: number): Promise<Maquina | null> {
    await this.initialize();
    return await this.maquinaRepository.findOne({
      where: { id }
    });
  }

  // UPDATE
  async updateMaquina(
    id: number,
    updateData: {
      nombre?: string;
      tipo?: string;
      estado?: EstadoMaquina;
      ubicacion?: string;
      fecha_compra?: Date;
      fecha_garantia?: Date;
    }
  ): Promise<Maquina | null> {
    await this.initialize();
    await this.maquinaRepository.update(id, updateData);
    return await this.getMaquinaById(id);
  }

  // DELETE
  async deleteMaquina(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.maquinaRepository.delete(id);
    return result.affected !== 0;
  }

  // Búsqueda por estado
  async getMaquinasByEstado(estado: EstadoMaquina): Promise<Maquina[]> {
    await this.initialize();
    return await this.maquinaRepository.find({
      where: { estado },
      order: { id: "DESC" }
    });
  }

  // Búsqueda por tipo
  async getMaquinasByTipo(tipo: string): Promise<Maquina[]> {
    await this.initialize();
    return await this.maquinaRepository.find({
      where: { tipo },
      order: { id: "DESC" }
    });
  }

  // Búsqueda por nombre
  async searchMaquinasByName(nombre: string): Promise<Maquina[]> {
    await this.initialize();
    return await this.maquinaRepository
      .createQueryBuilder("maquina")
      .where("maquina.nombre ILIKE :nombre", { nombre: `%${nombre}%` })
      .getMany();
  }
}