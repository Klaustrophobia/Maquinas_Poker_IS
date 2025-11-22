import { MaquinaClienteService } from "../services/MaquinaCliente.service";
import { AppDataSource } from "../lib/db";
import { Repository } from "typeorm";
import { Usuario } from "../entities/Usuario";
import { Maquina } from "../entities/Maquina";
import { MaquinaCliente } from "../entities/MaquinaCliente";

// Mock de AppDataSource
jest.mock("../lib/db", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
  initializeDatabase: jest.fn(),
}));

describe("MaquinaClienteService", () => {
  let service: MaquinaClienteService;
  let usuarioRepoMock: jest.Mocked<Repository<Usuario>>;
  let maquinaRepoMock: jest.Mocked<Repository<Maquina>>;
  let maquinaClienteRepoMock: jest.Mocked<Repository<MaquinaCliente>>;

  const mockCliente: Usuario = {
    id: 1,
    nombre_usuario: "Cliente1",
    contraseña: "123456",
    rol: "cliente",
    correo: "cliente1@example.com",
    fecha_creacion: new Date(),
    activo: true,
    identificador_unico: "C1",
    codigo_login: undefined,
  };

  const mockMaquina = {
    id: 10,
    nombre: "Máquina A",
    tipo: "Tipo1",
    estado: "Disponible", // Asegúrate de que el enum o string coincida
    ubicacion: "Sucursal 1",
    fecha_compra: new Date(),
    fecha_garantia: new Date(),
  } as unknown as Maquina;

  const mockAsignacion: MaquinaCliente = {
    id: 100,
    cliente: mockCliente,
    maquina: mockMaquina,
    estado: "Asignada",
    fecha_asignacion: new Date(),
  };

  beforeEach(() => {
    service = new MaquinaClienteService();

    // Crear mocks completos para TypeORM Repository
    usuarioRepoMock = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Repository<Usuario>>;

    maquinaRepoMock = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Repository<Maquina>>;

    maquinaClienteRepoMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<MaquinaCliente>>;

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Usuario) return usuarioRepoMock;
      if (entity === Maquina) return maquinaRepoMock;
      if (entity === MaquinaCliente) return maquinaClienteRepoMock;
    });

    jest.clearAllMocks();
  });

  test("asignar() lanza error si el cliente no existe", async () => {
    usuarioRepoMock.findOneBy.mockResolvedValue(null);

    await expect(service.asignar(1, 10)).rejects.toThrow("Cliente no encontrado");
  });

  test("asignar() lanza error si la máquina no existe", async () => {
    usuarioRepoMock.findOneBy.mockResolvedValue(mockCliente);
    maquinaRepoMock.findOneBy.mockResolvedValue(null);

    await expect(service.asignar(1, 10)).rejects.toThrow("Máquina no encontrada");
  });

  test("asignar() lanza error si la máquina ya está asignada", async () => {
    usuarioRepoMock.findOneBy.mockResolvedValue(mockCliente);
    maquinaRepoMock.findOneBy.mockResolvedValue(mockMaquina);
    maquinaClienteRepoMock.findOne.mockResolvedValue(mockAsignacion);

    await expect(service.asignar(1, 10)).rejects.toThrow(
      "Esta máquina ya está asignada a un cliente"
    );
  });

  test("asignar() asigna máquina correctamente", async () => {
    usuarioRepoMock.findOneBy.mockResolvedValue(mockCliente);
    maquinaRepoMock.findOneBy.mockResolvedValue(mockMaquina);
    maquinaClienteRepoMock.findOne.mockResolvedValue(null);
    maquinaClienteRepoMock.create.mockReturnValue(mockAsignacion);
    maquinaClienteRepoMock.save.mockResolvedValue(mockAsignacion);

    const result = await service.asignar(1, 10);

    expect(result).toBe(mockAsignacion);
    expect(maquinaClienteRepoMock.create).toHaveBeenCalledWith({
      cliente: mockCliente,
      maquina: mockMaquina,
      estado: "Asignada",
    });
    expect(maquinaClienteRepoMock.save).toHaveBeenCalledWith(mockAsignacion);
  });

  test("desasignar() lanza error si la máquina no está asignada", async () => {
    maquinaClienteRepoMock.findOne.mockResolvedValue(null);

    await expect(service.desasignar(10)).rejects.toThrow(
      "La máquina no está asignada a ningún cliente"
    );
  });

  test("desasignar() elimina asignación correctamente", async () => {
    maquinaClienteRepoMock.findOne.mockResolvedValue(mockAsignacion);
    maquinaClienteRepoMock.remove.mockResolvedValue(mockAsignacion);

    const result = await service.desasignar(10);

    expect(result).toEqual({ mensaje: "Máquina desasignada correctamente" });
    expect(maquinaClienteRepoMock.remove).toHaveBeenCalledWith(mockAsignacion);
  });

  test("listarPorCliente() retorna asignaciones", async () => {
    maquinaClienteRepoMock.find.mockResolvedValue([mockAsignacion]);

    const result = await service.listarPorCliente(1);

    expect(result).toEqual([mockAsignacion]);
    expect(maquinaClienteRepoMock.find).toHaveBeenCalledWith({
      where: { cliente: { id: 1 } },
      relations: ["maquina"],
    });
  });

  test("obtenerClienteActual() retorna null si no hay asignación", async () => {
    maquinaClienteRepoMock.findOne.mockResolvedValue(null);

    const result = await service.obtenerClienteActual(10);

    expect(result).toBeNull();
  });

  test("obtenerClienteActual() retorna asignación existente", async () => {
    maquinaClienteRepoMock.findOne.mockResolvedValue(mockAsignacion);

    const result = await service.obtenerClienteActual(10);

    expect(result).toEqual({
      cliente_id: mockCliente.id,
      cliente_nombre: mockCliente.nombre_usuario,
      fecha_asignacion: mockAsignacion.fecha_asignacion,
    });
  });
});
