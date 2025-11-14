import { AppDataSource, initializeDatabase } from "@/lib/db";
import { Repuesto } from "@/entities/Repuesto";
import { Proveedor } from "@/entities/Proveedor";
import { Repository } from "typeorm";

export class RepuestoRepository {
  private repuestoRepository: Repository<Repuesto>;
  private proveedorRepository: Repository<Proveedor>;

  constructor() {
    this.repuestoRepository = AppDataSource.getRepository(Repuesto);
    this.proveedorRepository = AppDataSource.getRepository(Proveedor);
  }

  private async initialize() {
    await initializeDatabase();
  }

  // CREATE
  async create(repuestoData: {
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
  async findAll(): Promise<Repuesto[]> {
    await this.initialize();
    return await this.repuestoRepository.find({
      relations: ["proveedor"],
      order: { id: "DESC" }
    });
  }

  // READ BY ID
  async findById(id: number): Promise<Repuesto | null> {
    await this.initialize();
    return await this.repuestoRepository.findOne({
      where: { id },
      relations: ["proveedor"]
    });
  }

  // UPDATE
  async update(
    id: number,
    updateData: {
      nombre?: string;
      cantidad?: number;
      ubicacion?: string;
      estado?: string;
      proveedor?: Proveedor;
    }
  ): Promise<void> {
    await this.initialize();
    await this.repuestoRepository.update(id, updateData);
  }

  // DELETE
  async delete(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.repuestoRepository.delete(id);
    return result.affected !== 0;
  }

  // Buscar repuestos por nombre
  async searchByName(nombre: string): Promise<Repuesto[]> {
    await this.initialize();
    return await this.repuestoRepository
      .createQueryBuilder("repuesto")
      .leftJoinAndSelect("repuesto.proveedor", "proveedor")
      .where("repuesto.nombre ILIKE :nombre", { nombre: `%${nombre}%` })
      .getMany();
  }

  // Método auxiliar para buscar proveedor por ID
  async findProveedorById(id: number): Promise<Proveedor | null> {
    await this.initialize();
    return await this.proveedorRepository.findOne({
      where: { id }
    });
  }
}