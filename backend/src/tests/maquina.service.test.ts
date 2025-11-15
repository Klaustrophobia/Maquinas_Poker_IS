import { MaquinaService } from "../services/Maquina.service";
import { Maquina, EstadoMaquina } from "../entities/Maquina";
import { MaquinaRepository } from "../repositories/Maquina.repository";

// En esta linea simulamos el repositorio
jest.mock("../repositories/Maquina.repository");

describe("MaquinaService", () => {
  let service: MaquinaService;
  let repoMock: jest.Mocked<MaquinaRepository>;

  const mockMaquina: Maquina = {
    id: 1,
    nombre: "Maquina Prueba",
    tipo: "prueba",
    estado: EstadoMaquina.FUNCIONANDO,
    ubicacion: "Torocagua",
    fecha_compra: new Date("2025-01-01"),
    fecha_garantia: new Date("2028-01-01"),
  };

  beforeEach(() => {
    service = new MaquinaService();
    repoMock = (MaquinaRepository as jest.Mock).mock.instances[0];
    jest.clearAllMocks();
  });

  test("createMaquina() debe crear una máquina", async () => {
    repoMock.create.mockResolvedValue(mockMaquina);

    const result = await service.createMaquina({
      nombre: "Maquina Prueba",
      tipo: "prueba",
      estado: EstadoMaquina.FUNCIONANDO,
      ubicacion: "Torocagua",
      fecha_compra: new Date("2025-01-01"),
      fecha_garantia: new Date("2028-01-01"),
    });

    expect(result).toEqual(mockMaquina);
    expect(repoMock.create).toHaveBeenCalled();
  });

  test("getAllMaquinas() debe llamar findAll y devolver todas las máquinas", async () => {
    repoMock.findAll.mockResolvedValue([mockMaquina]);

    const result = await service.getAllMaquinas();

    expect(result).toEqual([mockMaquina]);
    expect(repoMock.findAll).toHaveBeenCalled();
  });

  test("getMaquinaById() debe devolver una máquina por ID", async () => {
    repoMock.findById.mockResolvedValue(mockMaquina);

    const result = await service.getMaquinaById(1);

    expect(result).toEqual(mockMaquina);
    expect(repoMock.findById).toHaveBeenCalledWith(1);
  });

  test("updateMaquina() debe actualizar una máquina existente", async () => {
    repoMock.update.mockResolvedValue(undefined);
    repoMock.findById.mockResolvedValue({
      ...mockMaquina,
      nombre: "Maquina actualizada",
    });

    const result = await service.updateMaquina(1, {
      nombre: "Maquina actualizada",
    });

    expect(repoMock.update).toHaveBeenCalledWith(1, { nombre: "Maquina actualizada" });
    expect(result?.nombre).toBe("Maquina actualizada");
  });

  test("deleteMaquina() debe eliminar una máquina", async () => {
    repoMock.delete.mockResolvedValue(true);

    const result = await service.deleteMaquina(1);

    expect(result).toBe(true);
    expect(repoMock.delete).toHaveBeenCalledWith(1);
  });

  test("getMaquinasByEstado() debe buscar máquinas por estado", async () => {
    repoMock.findByEstado.mockResolvedValue([mockMaquina]);

    const result = await service.getMaquinasByEstado(EstadoMaquina.FUNCIONANDO);

    expect(result).toEqual([mockMaquina]);
    expect(repoMock.findByEstado).toHaveBeenCalledWith(EstadoMaquina.FUNCIONANDO);
  });

  test("getMaquinasByTipo() debe buscar máquinas por tipo", async () => {
    repoMock.findByTipo.mockResolvedValue([mockMaquina]);

    const result = await service.getMaquinasByTipo("prueba");

    expect(result).toEqual([mockMaquina]);
    expect(repoMock.findByTipo).toHaveBeenCalledWith("prueba");
  });

  test("searchMaquinasByName() debe buscar máquinas por nombre", async () => {
    repoMock.searchByName.mockResolvedValue([mockMaquina]);

    const result = await service.searchMaquinasByName("Maquina Prueba");

    expect(result).toEqual([mockMaquina]);
    expect(repoMock.searchByName).toHaveBeenCalledWith("Maquina Prueba");
  });

});
