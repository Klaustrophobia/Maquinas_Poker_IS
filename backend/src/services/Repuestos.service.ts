import { AppDataSource, initializeDatabase } from "@/lib/db";
import { Repuesto } from "@/entities/Repuesto";
import { Proveedor } from "@/entities/Proveedor";

export class RepuestoService {
  private repuestoRepository = AppDataSource.getRepository(Repuesto);
  private proveedorRepository = AppDataSource.getRepository(Proveedor);

  async initialize() {
    await initializeDatabase();
  }

  // CREATE
  async createRepuesto(repuestoData: {
    nombre: string;
    proveedor_id: number;
    cantidad: number;
    ubicacion?: string;
    estado: string;
  }): Promise<Repuesto> {
    await this.initialize();
    
    const proveedor = await this.proveedorRepository.findOne({
      where: { id: repuestoData.proveedor_id }
    });

    if (!proveedor) {
      throw new Error("Proveedor no encontrado");
    }

    const repuesto = this.repuestoRepository.create({
      nombre: repuestoData.nombre,
      cantidad: repuestoData.cantidad,
      ubicacion: repuestoData.ubicacion,
      estado: repuestoData.estado,
      proveedor: proveedor
    });

    return await this.repuestoRepository.save(repuesto);
  }

  // READ ALL
  async getAllRepuestos(): Promise<Repuesto[]> {
    await this.initialize();
    return await this.repuestoRepository.find({
      relations: ["proveedor"],
      order: { id: "DESC" }
    });
  }

  // READ BY ID
  async getRepuestoById(id: number): Promise<Repuesto | null> {
    await this.initialize();
    return await this.repuestoRepository.findOne({
      where: { id },
      relations: ["proveedor"]
    });
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
    await this.initialize();

    const updatePayload: any = { ...updateData };

    if (updateData.proveedor_id) {
      const proveedor = await this.proveedorRepository.findOne({
        where: { id: updateData.proveedor_id }
      });

      if (!proveedor) {
        throw new Error("Proveedor no encontrado");
      }

      updatePayload.proveedor = proveedor;
      delete updatePayload.proveedor_id;
    }

    await this.repuestoRepository.update(id, updatePayload);
    return await this.getRepuestoById(id);
  }

  // DELETE
  async deleteRepuesto(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.repuestoRepository.delete(id);
    return result.affected !== 0;
  }

  // Buscar repuestos por nombre
  async searchRepuestosByName(nombre: string): Promise<Repuesto[]> {
    await this.initialize();
    return await this.repuestoRepository
      .createQueryBuilder("repuesto")
      .leftJoinAndSelect("repuesto.proveedor", "proveedor")
      .where("repuesto.nombre ILIKE :nombre", { nombre: `%${nombre}%` })
      .getMany();
  }
}