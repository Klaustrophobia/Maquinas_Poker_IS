import { AppDataSource, initializeDatabase } from "../lib/db";
import { Proveedor } from "@/entities/Proveedor";
import { Repository } from "typeorm";

export class ProveedorRepository {
  private repo: Repository<Proveedor>;

  constructor() {
    this.repo = AppDataSource.getRepository(Proveedor);
  }

  async findAll() {
    await initializeDatabase();
    return await this.repo.find();
  }

  async findById(id: number) {
    await initializeDatabase();
    return await this.repo.findOneBy({ id });
  }

  async create(data: Partial<Proveedor>) {
    await initializeDatabase();
    const proveedor = this.repo.create(data);
    return await this.repo.save(proveedor);
  }

  async update(id: number, data: Partial<Proveedor>) {
    await initializeDatabase();
    const proveedor = await this.repo.findOneBy({ id });
    if (!proveedor) return null;

    this.repo.merge(proveedor, data);
    return await this.repo.save(proveedor);
  }

  async findByName(nombre: string) {
    await initializeDatabase();
    return await this.repo.findOneBy({ nombre });
  }
}
