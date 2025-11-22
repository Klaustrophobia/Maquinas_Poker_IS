import { ReciboService } from "../services/Recibo.service";
import { ReciboRepository } from "../repositories/Recibo.repository";
import { UsuarioRepository } from "../repositories/Usuarios.repository";
import { MaquinaRepository } from "../repositories/Maquina.repository";
import { Recibo } from "../entities/Recibo";
import { Usuario } from "../entities/Usuario";
import { Maquina } from "../entities/Maquina";
import { CrearReciboDTO } from "../dtos/CrearReciboDTO";

// Mock de repositorios
jest.mock("../repositories/Recibo.repository");
jest.mock("../repositories/Usuarios.repository");
jest.mock("../repositories/Maquina.repository");
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'FAKE_UUID'),
}));


describe("ReciboService", () => {
  let service: ReciboService;
  let reciboRepoMock: jest.Mocked<ReciboRepository>;
  let usuarioRepoMock: jest.Mocked<UsuarioRepository>;
  let maquinaRepoMock: jest.Mocked<MaquinaRepository>;

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

  const mockMaquina: Maquina = {
    id: 10,
    nombre: "Máquina A",
    tipo: "Tipo1",
    estado: "Disponible",
    ubicacion: "Sucursal 1",
    fecha_compra: new Date(),
    fecha_garantia: new Date(),
  } as unknown as Maquina;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReciboService();

    reciboRepoMock = (ReciboRepository as jest.Mock).mock.instances[0];
    usuarioRepoMock = (UsuarioRepository as jest.Mock).mock.instances[0];
    maquinaRepoMock = (MaquinaRepository as jest.Mock).mock.instances[0];
  });

  test("generarRecibo() lanza error si el cliente no existe", async () => {
    usuarioRepoMock.findById.mockResolvedValue(null);

    const dto: CrearReciboDTO = {
      cliente_id: 999,
      fecha_recibo: "2025-11-21",
      maquinas: [],
    };

    await expect(service.generarRecibo(dto)).rejects.toThrow("Cliente no encontrado");
  });

  test("generarRecibo() lanza error si alguna máquina no existe", async () => {
    usuarioRepoMock.findById.mockResolvedValue(mockCliente);
    maquinaRepoMock.findById.mockResolvedValue(null);

    const dto: CrearReciboDTO = {
      cliente_id: 1,
      fecha_recibo: "2025-11-21",
      maquinas: [{ maquina_id: 10, ingreso: 100, egreso: 50, total: 50 }],
    };

    await expect(service.generarRecibo(dto)).rejects.toThrow("Máquina con ID 10 no encontrada");
  });

  test("generarRecibo() genera recibo correctamente", async () => {
    usuarioRepoMock.findById.mockResolvedValue(mockCliente);
    maquinaRepoMock.findById.mockResolvedValue(mockMaquina);

    const dto: CrearReciboDTO = {
      cliente_id: 1,
      fecha_recibo: "2025-11-21",
      maquinas: [{ maquina_id: 10, ingreso: 100, egreso: 40, total: 60 }],
    };

    const mockRecibo: Recibo = {
      id: 500,
      cliente: mockCliente,
      maquina: mockMaquina,
      ingreso: 100,
      egreso: 40,
      total: 60,
      fecha_recibo: new Date(dto.fecha_recibo),
      lote_recibo: 1001,
    } as Recibo;

    reciboRepoMock.crearMultiplesRecibos.mockResolvedValue([mockRecibo]);

    const result = await service.generarRecibo(dto);

    expect(usuarioRepoMock.findById).toHaveBeenCalledWith(1);
    expect(maquinaRepoMock.findById).toHaveBeenCalledWith(10);
    expect(reciboRepoMock.crearMultiplesRecibos).toHaveBeenCalled();
    expect(result).toMatchObject({
      cliente: { id: 1, nombre: "Cliente1" },
      lote_recibo: 1001,
      maquinas: [{ id: 10, nombre: "Máquina A", ingreso: 100, egreso: 40, total: 60 }],
      total_ingresos: 100,
      total_egresos: 40,
      total_neto: 60,
      parte_empresa: 36,
      parte_cliente: 24,
    });
  });

  test("obtenerReciboPorId() retorna null si no existe", async () => {
    reciboRepoMock.obtenerReciboPorId.mockResolvedValue(null);

    const result = await service.obtenerReciboPorId(999);
    expect(result).toBeNull();
  });

  test("eliminarRecibo() retorna false si el recibo no existe", async () => {
    reciboRepoMock.obtenerReciboPorId.mockResolvedValue(null);

    const result = await service.eliminarRecibo(999);
    expect(result).toBe(false);
  });

  test("eliminarRecibo() elimina recibos del mismo lote", async () => {
    const mockRecibo: Recibo = {
      id: 500,
      cliente: mockCliente,
      maquina: mockMaquina,
      ingreso: 100,
      egreso: 50,
      total: 50,
      fecha_recibo: new Date(),
      lote_recibo: 1001,
    } as Recibo;

    reciboRepoMock.obtenerReciboPorId.mockResolvedValue(mockRecibo);
    reciboRepoMock.obtenerRecibosPorLote.mockResolvedValue([mockRecibo]);
    reciboRepoMock.eliminarRecibo.mockResolvedValue(true);

    const result = await service.eliminarRecibo(500);

    expect(reciboRepoMock.eliminarRecibo).toHaveBeenCalledWith(500);
    expect(result).toBe(true);
  });
});