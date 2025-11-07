import { AppDataSource, initializeDatabase } from "../lib/db";
import { Proveedor } from "@/entities/Proveedor";

export class ProveedorService {
  private async getRepository() {
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }
    return AppDataSource.getRepository(Proveedor);
  }

  async obtenerTodosLosProveedores(): Promise<Proveedor[]> {
    const repo = await this.getRepository();
    return await repo.find();
  }

  async obtenerProveedorPorId(id: number): Promise<Proveedor | null> {
    const repo = await this.getRepository();
    return await repo.findOneBy({ id });
  }

  async crearProveedor(data: Partial<Proveedor>): Promise<Proveedor> {
    const repo = await this.getRepository();
    const nuevoProveedor = repo.create(data);
    return await repo.save(nuevoProveedor);
  }

  async actualizarDatosProveedor(id: number, data: Partial<Proveedor>): Promise<Proveedor | null> {
    const repo = await this.getRepository();
    const proveedor = await repo.findOneBy({ id });
    if (!proveedor) return null;

    repo.merge(proveedor, data);
    return await repo.save(proveedor);
  }

  async eliminarProveedor(id: number): Promise<boolean> {
    const repo = await this.getRepository();
    
    const resultado = await repo.delete(id);
    return resultado.affected !== 0;
  }

}