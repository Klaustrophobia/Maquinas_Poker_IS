import { LoteReciboService } from "@/services/LoteRecibo.service";
import { LoteReciboRepository } from "@/repositories/LoteRecibo.repository";
import { ReciboRepository } from "@/repositories/Recibo.repository";

// Mock de repositorios
jest.mock("@/repositories/LoteRecibo.repository");
jest.mock("@/repositories/Recibo.repository");

describe("LoteReciboService", () => {
  let service: LoteReciboService;
  let loteRepoMock: jest.Mocked<LoteReciboRepository>;
  let reciboRepoMock: jest.Mocked<ReciboRepository>;

  const mockLote = {
    id: 1001,
    cliente_id: 2,
    cliente: {
      id: 2,
      nombre_usuario: "jfunez",
      contraseña: "123456",
      rol: "cliente",
      correo: "jfunez@example.com",
      fecha_creacion: new Date("2025-01-01"),
      activo: true
    },
    fecha_recibo: new Date("2025-11-22"),
    ingreso: 16999.97,
    egreso: 10750,
    total: 6249.97,
    parteEmpresa: 3749.982,
    parteCliente: 2499.988,
    cantidadRecibos: 2,
    fecha_creacion: new Date("2025-11-22T02:08:19.441Z"),
  };

  const mockRecibos = [
    {
      id: 1,
      maquina: { id: 10, nombre: "Máquina A" },
      ingreso: 100,
      egreso: 50,
      total: 50,
      fecha_recibo: new Date("2025-11-21"),
      cliente: { id: 2, nombre: "jfunez" },
      fecha_creacion: new Date("2025-11-21"),
      lote_recibo: 1001,
    },
    {
      id: 2,
      maquina: { id: 11, nombre: "Máquina B" },
      ingreso: 200,
      egreso: 75,
      total: 125,
      fecha_recibo: new Date("2025-11-21"),
      cliente: { id: 2, nombre: "jfunez" },
      fecha_creacion: new Date("2025-11-21"),
      lote_recibo: 1001,
    }
  ];

  beforeEach(() => {
    service = new LoteReciboService();
    loteRepoMock = (LoteReciboRepository as jest.Mock).mock.instances[0];
    reciboRepoMock = (ReciboRepository as jest.Mock).mock.instances[0];
    jest.clearAllMocks();
  });

  test("obtenerTodosLosLotes() retorna los lotes mapeados correctamente", async () => {
    loteRepoMock.obtenerTodosLosLotes.mockResolvedValue([mockLote]);

    const result = await service.obtenerTodosLosLotes();

    expect(loteRepoMock.obtenerTodosLosLotes).toHaveBeenCalled();
    expect(result[0]).toMatchObject({
      id: 1001,
      cliente_id: 2,
      cliente: { id: 2, nombre: "jfunez" },
      ingreso: 16999.97,
      egreso: 10750,
      total: 6249.97,
    });
  });

  test("obtenerLotesPorCliente() retorna lotes filtrados", async () => {
    loteRepoMock.obtenerLotesPorCliente.mockResolvedValue([mockLote]);

    const result = await service.obtenerLotesPorCliente(2);

    expect(loteRepoMock.obtenerLotesPorCliente).toHaveBeenCalledWith(2);
    expect(result.length).toBe(1);
    expect(result[0].cliente_id).toBe(2);
  });

  test("obtenerLotePorId() retorna un lote con recibos mapeados", async () => {
    loteRepoMock.obtenerLotePorId.mockResolvedValue(mockLote);
    reciboRepoMock.obtenerRecibosPorLote.mockResolvedValue(mockRecibos);

    const result = await service.obtenerLotePorId(1001);

    expect(loteRepoMock.obtenerLotePorId).toHaveBeenCalledWith(1001);
    expect(reciboRepoMock.obtenerRecibosPorLote).toHaveBeenCalledWith(1001);

    expect(result?.id).toBe(1001);
    expect(result?.recibos?.length).toBe(2);
    expect(result?.recibos?.[0]).toMatchObject({
      id: 1,
      total: 50,
      maquina: { id: 10, nombre: "Máquina A", codigo: "MAQ-10" }
    });
  });

  test("obtenerLotePorId() retorna null si no existe", async () => {
    loteRepoMock.obtenerLotePorId.mockResolvedValue(null);

    const result = await service.obtenerLotePorId(9999);

    expect(result).toBeNull();
  });

  test("obtenerLotesConFiltros() envía los filtros al repositorio", async () => {
    loteRepoMock.obtenerLotesConFiltros.mockResolvedValue([mockLote]);

    const filtros = {
      clienteId: 2,
      fechaInicio: "2025-11-01",
      fechaFin: "2025-11-30"
    };

    const result = await service.obtenerLotesConFiltros(filtros);

    expect(loteRepoMock.obtenerLotesConFiltros).toHaveBeenCalled();
    expect(result.length).toBe(1);
  });

  test("eliminarLote() elimina recibos y luego el lote", async () => {
    reciboRepoMock.obtenerRecibosPorLote.mockResolvedValue(mockRecibos);
    reciboRepoMock.eliminarRecibo.mockResolvedValue(true);
    loteRepoMock.eliminarLote.mockResolvedValue(true);

    const result = await service.eliminarLote(1001);

    expect(reciboRepoMock.obtenerRecibosPorLote).toHaveBeenCalledWith(1001);
    expect(reciboRepoMock.eliminarRecibo).toHaveBeenCalledTimes(2);
    expect(loteRepoMock.eliminarLote).toHaveBeenCalledWith(1001);
    expect(result).toBe(true);
  });
});