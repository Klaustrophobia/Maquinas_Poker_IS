import { ProveedorRepository } from "@/repositories/Proveedor.repository";
import { Proveedor } from "@/entities/Proveedor";

export class ProveedorService {
  private proveedorRepo: ProveedorRepository;

  constructor() {
    this.proveedorRepo = new ProveedorRepository();
  }

  async obtenerTodosLosProveedores(): Promise<Proveedor[]> {
    return await this.proveedorRepo.findAll();
  }

  async obtenerProveedorPorId(id: number): Promise<Proveedor | null> {
    return await this.proveedorRepo.findById(id);
  }

  async crearProveedor(data: Partial<Proveedor>): Promise<Proveedor> {
    const proveedores = await this.proveedorRepo.findAll();
    const existe = proveedores.find(
      (p) => p.informacion_contacto === data.informacion_contacto
    );

    if (existe) {
      throw new Error("Ya existe un proveedor con este correo electrónico");
    }

    return await this.proveedorRepo.create(data);
  }

  async actualizarDatosProveedor(
    id: number,
    data: Partial<Proveedor>
  ): Promise<Proveedor> {
    const proveedor = await this.proveedorRepo.findById(id);
    if (!proveedor) {
      throw new Error("Proveedor no encontrado");
    }

    const actualizado = await this.proveedorRepo.update(id, data);
    if (!actualizado) {
      throw new Error("No se pudo actualizar el proveedor");
    }
    return actualizado;
  }

  async buscarProveedorPorNombre(nombre: string): Promise<Proveedor | null> {
    return await this.proveedorRepo.findByName(nombre);
  }
}
