import { ProveedorService } from "../services/Proveedor.service";
import { Proveedor } from "../entities/Proveedor";
import { ProveedorRepository } from "../repositories/Proveedor.repository";

// En esta linea simulamos el repositorio
jest.mock("../repositories/Proveedor.repository");

describe("ProveedorService", () => {
  let service: ProveedorService;
  let repoMock: jest.Mocked<ProveedorRepository>;

  const mockProveedor: Proveedor = {
    id: 1,
    nombre: "Proveedor Prueba",
    informacion_contacto: "proveedor_prueba@email.com",
    direccion: "Calle Prueba",
    fecha_creacion: new Date()
  };

  beforeEach(() => {
    service = new ProveedorService();
    repoMock = (ProveedorRepository as jest.Mock).mock.instances[0];
    jest.clearAllMocks();
  });

  test("Se testea el servicio obtenerTodosLosProveedores() y findAll", async () => {
    repoMock.findAll.mockResolvedValue([mockProveedor]);

    const result = await service.obtenerTodosLosProveedores();

    expect(result).toEqual([mockProveedor]);
    expect(repoMock.findAll).toHaveBeenCalled();
  });

  test("Se testea el servicio obtenerProveedorPorId() y findById", async () => {
    repoMock.findById.mockResolvedValue(mockProveedor);

    const result = await service.obtenerProveedorPorId(1);

    expect(result).toEqual(mockProveedor);
    expect(repoMock.findById).toHaveBeenCalledWith(1);
  });

  test("Se testea el servicio crearProveedor() lanza error si el correo ya existe", async () => {
    repoMock.findAll.mockResolvedValue([mockProveedor]);

    await expect(
      service.crearProveedor({
        nombre: "Proveedor Prueba 2",
        informacion_contacto: "proveedor_prueba@email.com",
      })
    ).rejects.toThrow("Ya existe un proveedor con este correo electrónico");
  });

  test("Se testea el servicio crearProveedor() crea un nuevo proveedor si el correo no existe", async () => {
    repoMock.findAll.mockResolvedValue([]);
    repoMock.create.mockResolvedValue(mockProveedor);

    const result = await service.crearProveedor({
      nombre: "Proveedor Nuevo",
      informacion_contacto: "proveedor_nuevo@email.com",
    });

    expect(result).toEqual(mockProveedor);
    expect(repoMock.create).toHaveBeenCalled();
  });

  test("Se testea el servicio actualizarDatosProveedor() devuelve error si no se encuentra", async () => {
    repoMock.findById.mockResolvedValue(null);

    const result = service.actualizarDatosProveedor(123, { nombre: "Proveedor Actualizado" });
    await expect(result).rejects.toThrow("Proveedor no encontrado");
  });

  test("Se testea el servicio actualizarDatosProveedor() actualiza un proveedor si existe", async () => {
    repoMock.findById.mockResolvedValue(mockProveedor);
    repoMock.update.mockResolvedValue({
      ...mockProveedor,
      nombre: "Proveedor Actualizado Prueba",
    });

    const result = await service.actualizarDatosProveedor(1, { nombre: "Proveedor Actualizado Prueba" });

    expect(result.nombre).toBe("Proveedor Actualizado Prueba");
    expect(repoMock.update).toHaveBeenCalledWith(1, { nombre: "Proveedor Actualizado Prueba" });
  });

  test("Se testea el servicio buscarProveedorPorNombre() y findByName", async () => {
    repoMock.findByName.mockResolvedValue(mockProveedor);

    const result = await service.buscarProveedorPorNombre("Proveedor Prueba");

    expect(result).toEqual(mockProveedor);
    expect(repoMock.findByName).toHaveBeenCalledWith("Proveedor Prueba");
  });
  
});