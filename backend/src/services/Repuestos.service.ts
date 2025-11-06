// services/RepuestoService.ts
import { AppDataSource } from "../lib/db";
import { Repuesto } from "../entities/Repuestos";
import { Proveedor } from "../entities/Proveedor";
import { Repository } from "typeorm";

export class RepuestoService {
  private repuestoRepository: Repository<Repuesto>;
  private proveedorRepository: Repository<Proveedor>;

  constructor() {
    this.repuestoRepository = AppDataSource.getRepository(Repuesto);
    this.proveedorRepository = AppDataSource.getRepository(Proveedor);
  }

  // CREATE
  async crearRepuesto(repuestoData: {
    nombre: string;
    proveedor_id: number;
    cantidad: number;
    ubicacion?: string;
    estado: string;
  }): Promise<Repuesto> {
    // Verificar que el proveedor existe
    const proveedor = await this.proveedorRepository.findOne({
      where: { id: repuestoData.proveedor_id }
    });

    if (!proveedor) {
      throw new Error("Proveedor no encontrado");
    }

    const repuesto = this.repuestoRepository.create({
      ...repuestoData,
      proveedor: proveedor
    });

    return await this.repuestoRepository.save(repuesto);
  }

  // READ - Todos los repuestos
  async obtenerTodosLosRepuestos(): Promise<Repuesto[]> {
    return await this.repuestoRepository.find({
      relations: ["proveedor"]
    });
  }

  // READ - Repuesto por ID
  async obtenerRepuestoPorId(id: number): Promise<Repuesto | null> {
    return await this.repuestoRepository.findOne({
      where: { id },
      relations: ["proveedor"]
    });
  }

  // UPDATE
  async actualizarRepuesto(
  id: number,
  updateData: {
    nombre?: string;
    proveedor_id?: number;
    cantidad?: number;
    ubicacion?: string;
    estado?: string;
  }
): Promise<Repuesto | null> {
  // Si se quiere actualizar el proveedor, verificamos que exista
  if (updateData.proveedor_id) {
    const proveedor = await this.proveedorRepository.findOne({
      where: { id: updateData.proveedor_id }
    });

    if (!proveedor) {
      throw new Error("Proveedor no encontrado");
    }

    // Actualizamos usando la relación directamente
    await this.repuestoRepository.update(id, {
      ...updateData,
      proveedor: proveedor  // Asignamos el objeto proveedor completo a la relación
    });
    
    // Eliminamos proveedor_id ya que no es una columna directa en la entidad
    delete updateData.proveedor_id;
  } else {
    // Si no se actualiza el proveedor, hacemos update normal
    await this.repuestoRepository.update(id, updateData);
  }

  return await this.obtenerRepuestoPorId(id);
}

  // DELETE
  async eliminarRepuesto(id: number): Promise<boolean> {
    const result = await this.repuestoRepository.delete(id);
    return result.affected !== 0;
  }

  // READ - Repuestos por proveedor
  async obtenerRepuestosPorProveedor(proveedorId: number): Promise<Repuesto[]> {
    return await this.repuestoRepository.find({
      where: { proveedor: { id: proveedorId } },
      relations: ["proveedor"]
    });
  }

  // READ - Repuestos por nombre (búsqueda)
  async buscarRepuestosPorNombre(nombre: string): Promise<Repuesto[]> {
    return await this.repuestoRepository
      .createQueryBuilder("repuesto")
      .where("repuesto.nombre ILIKE :nombre", { nombre: `%${nombre}%` })
      .leftJoinAndSelect("repuesto.proveedor", "proveedor")
      .getMany();
  }

  // UPDATE - Cantidad de repuesto
  async actualizarCantidadRepuesto(id: number, nuevaCantidad: number): Promise<Repuesto | null> {
    await this.repuestoRepository.update(id, { cantidad: nuevaCantidad });
    return await this.obtenerRepuestoPorId(id);
  }
}