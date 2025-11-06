// services/ProveedorService.ts
import { AppDataSource } from "../lib/db";
import { Proveedor } from "../entities/Proveedor";
import { Repository } from "typeorm";

export class ProveedorService {
  private proveedorRepository: Repository<Proveedor>;

  constructor() {
    this.proveedorRepository = AppDataSource.getRepository(Proveedor);
  }

  // CREATE
  async crearProveedor(proveedorData: {
    nombre: string;
    informacion_contacto: string;
    direccion: string;
  }): Promise<Proveedor> {
    const proveedor = this.proveedorRepository.create(proveedorData);
    return await this.proveedorRepository.save(proveedor);
  }

  // READ - Todos los proveedores
  async obtenerTodosLosProveedores(): Promise<Proveedor[]> {
    return await this.proveedorRepository.find({
      relations: ["repuestos"]
    });
  }

  // READ - Proveedor por ID
  async obtenerProveedorPorId(id: number): Promise<Proveedor | null> {
    return await this.proveedorRepository.findOne({
      where: { id },
      relations: ["repuestos"]
    });
  }

  // UPDATE
  async actualizarProveedor(
    id: number,
    updateData: {
      nombre?: string;
      informacion_contacto?: string;
      direccion?: string;
    }
  ): Promise<Proveedor | null> {
    await this.proveedorRepository.update(id, updateData);
    return await this.obtenerProveedorPorId(id);
  }

  // DELETE
  async eliminarProveedor(id: number): Promise<boolean> {
    const result = await this.proveedorRepository.delete(id);
    return result.affected !== 0;
  }

  // READ - Proveedores por nombre (búsqueda)
  async buscarProveedoresPorNombre(nombre: string): Promise<Proveedor[]> {
    return await this.proveedorRepository
      .createQueryBuilder("proveedor")
      .where("proveedor.nombre ILIKE :nombre", { nombre: `%${nombre}%` })
      .leftJoinAndSelect("proveedor.repuestos", "repuestos")
      .getMany();
  }
}