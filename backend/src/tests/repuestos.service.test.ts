import { RepuestoService } from "@/services/Repuestos.service";
import { Repuesto } from "@/entities/Repuesto";
import { RepuestoRepository } from "@/repositories/Repuestos.repository";

// En esta linea simulamos el repositorio
jest.mock("../repositories/Repuestos.repository");

describe("RepuestoService", () => {
  let service: RepuestoService;
  let repoMock: jest.Mocked<RepuestoRepository>;
  const mockRepuesto: Repuesto = {
    id: 1,
    nombre: "Repuesto Prueba",
    cantidad: 10,
    ubicacion: "Almacen A",
    estado: "Nuevo",
  };

  beforeEach(() => {
    service = new RepuestoService();
    repoMock = (RepuestoRepository as jest.Mock).mock.instances[0];
    jest.clearAllMocks();
  });

  test("createRepuesto() debe crear un repuesto", async () => {
    repoMock.create.mockResolvedValue(mockRepuesto);

    const result = await service.createRepuesto({
      nombre: "Repuesto Prueba",
      proveedor_id: 1,
      cantidad: 10,
      estado: "Nuevo",
      ubicacion: "Almacen A",
    });

    expect(result).toEqual(mockRepuesto);
    expect(repoMock.create).toHaveBeenCalledWith({
      nombre: "Repuesto Prueba",
      proveedor_id: 1,
      cantidad: 10,
      estado: "Nuevo",
      ubicacion: "Almacen A",
    });
  });

  test("getAllRepuestos() debe llamar findAll y devolver los repuestos", async () => {
    repoMock.findAll.mockResolvedValue([mockRepuesto]);

    const result = await service.getAllRepuestos();

    expect(result).toEqual([mockRepuesto]);
    expect(repoMock.findAll).toHaveBeenCalled();
  });

  test("getRepuestoById() debe llamar findById", async () => {
    repoMock.findById.mockResolvedValue(mockRepuesto);

    const result = await service.getRepuestoById(1);

    expect(result).toEqual(mockRepuesto);
    expect(repoMock.findById).toHaveBeenCalledWith(1);
  });

  test("updateRepuesto() debe actualizar el repuesto cuando el proveedor existe", async () => {
    const proveedor = { id: 2, nombre: "Proveedor Prueba" };

    repoMock.findProveedorById.mockResolvedValue(proveedor);
    repoMock.update.mockResolvedValue(undefined);
    repoMock.findById.mockResolvedValue({
      ...mockRepuesto,
      nombre: "Nuevo nombre del repuesto",
      proveedor,
    });

    const result = await service.updateRepuesto(1, {
      nombre: "Nuevo nombre del repuesto",
      proveedor_id: 2,
    });

    expect(repoMock.findProveedorById).toHaveBeenCalledWith(2);
    expect(repoMock.update).toHaveBeenCalledWith(1, {
      nombre: "Nuevo nombre del repuesto",
      proveedor,
    });
    expect(result).toBeDefined();
    expect(result!.nombre).toBe("Nuevo nombre del repuesto");
    expect(result!.proveedor).toEqual(proveedor);
  });

  test("updateRepuesto() debe lanzar error si el proveedor no existe", async () => {
    repoMock.findProveedorById.mockResolvedValue(null);

    await expect(
      service.updateRepuesto(1, { proveedor_id: 999 })
    ).rejects.toThrow("Proveedor no encontrado");

    expect(repoMock.findProveedorById).toHaveBeenCalledWith(999);
  });

  test("deleteRepuesto() debe eliminar el repuesto", async () => {
    repoMock.delete.mockResolvedValue(true);

    const result = await service.deleteRepuesto(1);

    expect(result).toBe(true);
    expect(repoMock.delete).toHaveBeenCalledWith(1);
  });

  test("searchRepuestosByName() debe buscar repuestos por nombre", async () => {
    repoMock.searchByName.mockResolvedValue([mockRepuesto]);

    const result = await service.searchRepuestosByName("Repuesto Prueba");

    expect(result).toEqual([mockRepuesto]);
    expect(repoMock.searchByName).toHaveBeenCalledWith("Repuesto Prueba");
  });

});