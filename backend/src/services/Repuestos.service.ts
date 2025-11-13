import { RepuestoRepository } from "@/repositories/Repuestos.repository";
import { Repuesto } from "@/entities/Repuesto";

export class RepuestoService {
  private repuestoRepository: RepuestoRepository;

  constructor() {
    this.repuestoRepository = new RepuestoRepository();
  }

  // CREATE
  async createRepuesto(repuestoData: {
    nombre: string;
    proveedor_id: number;
    cantidad: number;
    ubicacion?: string;
    estado: string;
  }): Promise<Repuesto> {
    return await this.repuestoRepository.create(repuestoData);
  }

  // READ ALL
  async getAllRepuestos(): Promise<Repuesto[]> {
    return await this.repuestoRepository.findAll();
  }

  // READ BY ID
  async getRepuestoById(id: number): Promise<Repuesto | null> {
    return await this.repuestoRepository.findById(id);
  }

  // UPDATE
  async updateRepuesto(
    id: number,
    updateData: {
      nombre?: string;
      cantidad?: number;
      ubicacion?: string;
      estado?: string;
      proveedor_id?: number;
    }
  ): Promise<Repuesto | null> {
    const updatePayload: any = { ...updateData };

    if (updateData.proveedor_id) {
      const proveedor = await this.repuestoRepository.findProveedorById(updateData.proveedor_id);

      if (!proveedor) {
        throw new Error("Proveedor no encontrado");
      }

      updatePayload.proveedor = proveedor;
      delete updatePayload.proveedor_id;
    }

    await this.repuestoRepository.update(id, updatePayload);
    return await this.repuestoRepository.findById(id);
  }

  // DELETE
  async deleteRepuesto(id: number): Promise<boolean> {
    return await this.repuestoRepository.delete(id);
  }

  // Buscar repuestos por nombre
  async searchRepuestosByName(nombre: string): Promise<Repuesto[]> {
    return await this.repuestoRepository.searchByName(nombre);
  }
}