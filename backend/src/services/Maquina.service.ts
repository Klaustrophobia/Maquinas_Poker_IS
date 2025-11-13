import { MaquinaRepository } from "@/repositories/Maquina.repository";
import { Maquina, EstadoMaquina } from "@/entities/Maquina";

export class MaquinaService {
  private maquinaRepository: MaquinaRepository;

  constructor() {
    this.maquinaRepository = new MaquinaRepository();
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
    return await this.maquinaRepository.create(maquinaData);
  }

  // READ ALL
  async getAllMaquinas(): Promise<Maquina[]> {
    return await this.maquinaRepository.findAll();
  }

  // READ BY ID
  async getMaquinaById(id: number): Promise<Maquina | null> {
    return await this.maquinaRepository.findById(id);
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
    await this.maquinaRepository.update(id, updateData);
    return await this.maquinaRepository.findById(id);
  }

  // DELETE
  async deleteMaquina(id: number): Promise<boolean> {
    return await this.maquinaRepository.delete(id);
  }

  // Búsqueda por estado
  async getMaquinasByEstado(estado: EstadoMaquina): Promise<Maquina[]> {
    return await this.maquinaRepository.findByEstado(estado);
  }

  // Búsqueda por tipo
  async getMaquinasByTipo(tipo: string): Promise<Maquina[]> {
    return await this.maquinaRepository.findByTipo(tipo);
  }

  // Búsqueda por nombre
  async searchMaquinasByName(nombre: string): Promise<Maquina[]> {
    return await this.maquinaRepository.searchByName(nombre);
  }
}