import { AppDataSource, initializeDatabase } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { Maquina } from "@/entities/Maquina";
import { MaquinaCliente } from "@/entities/MaquinaCliente";

export class MaquinaClienteService {

  async asignar(clienteId: number, maquinaId: number) {
    await initializeDatabase(); // asegúrate de inicializar antes
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const maquinaRepo = AppDataSource.getRepository(Maquina);
    const repo = AppDataSource.getRepository(MaquinaCliente);

    const cliente = await usuarioRepo.findOne({ where: { id: clienteId, activo: true } });
    if (!cliente) throw new Error("Cliente no encontrado o inactivo");

    const maquina = await maquinaRepo.findOneBy({ id: maquinaId });
    if (!maquina) throw new Error("Máquina no encontrada");

    if (maquina.estado !== "Funcionando") {
      throw new Error("La máquina no está en estado 'Funcionando'");
    }

    // Validar que la máquina no esté asignada
    const yaAsignada = await repo.findOne({
      where: { maquina: { id: maquinaId } },
    });
    if (yaAsignada) {
      throw new Error("Esta máquina ya está asignada a un cliente");
    }

    const asignacion = repo.create({
      cliente,
      maquina,
      estado: "Asignada",
    });

    return await repo.save(asignacion);
  }

  async listarPorCliente(clienteId: number) {
    await initializeDatabase();
    const repo = AppDataSource.getRepository(MaquinaCliente);

    return await repo.find({
      where: { cliente: { id: clienteId } },
      relations: ["maquina"],
    });
  }

  async desasignar(maquinaId: number) {
    await initializeDatabase();
    const repo = AppDataSource.getRepository(MaquinaCliente);

    const registro = await repo.findOne({
      where: { maquina: { id: maquinaId } },
    });

    if (!registro) {
      throw new Error("La máquina no está asignada a ningún cliente");
    }

    await repo.remove(registro);

    return { mensaje: "Máquina desasignada correctamente" };
  }

  async reasignar(maquinaId: number, nuevoClienteId: number, clienteAnteriorId?: number) {
    await initializeDatabase();
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const repo = AppDataSource.getRepository(MaquinaCliente);

    // Verificar que el cliente exista y esté activo xd
    const nuevoCliente = await usuarioRepo.findOne({ where : { id: nuevoClienteId, activo: true } });
    if (!nuevoCliente) {
      throw new Error("El nuevo cliente no existe o está inactivo");
    }

    
    const asignacionActual = await repo.findOne({
      where: { maquina: { id: maquinaId } },
      relations: ["cliente", "maquina"]
    });

    if (!asignacionActual) {
      throw new Error("La máquina no está asignada a ningún cliente");
    }

    
    if (clienteAnteriorId && asignacionActual.cliente.id !== clienteAnteriorId) {
      throw new Error("La máquina no está asignada al cliente especificado");
    }

    
    if (asignacionActual.cliente.id === nuevoClienteId) {
      throw new Error("La máquina ya está asignada a este cliente");
    }

    
    asignacionActual.cliente = nuevoCliente;
    asignacionActual.fecha_asignacion = new Date(); // Actualizar fecha de asignación

    return await repo.save(asignacionActual);
  }

  async obtenerClienteActual(maquinaId: number) {
    await initializeDatabase();
    const repo = AppDataSource.getRepository(MaquinaCliente);

    const asignacion = await repo.findOne({
      where: { maquina: { id: maquinaId } },
      relations: ["cliente"]
    });

    if (!asignacion) {
      return null;
    }

    return {
      cliente_id: asignacion.cliente.id,
      cliente_nombre: asignacion.cliente.nombre_usuario,
      fecha_asignacion: asignacion.fecha_asignacion
    };
  }

  async obtenerHistorialMaquina(maquinaId: number) {
    await initializeDatabase();
    const repo = AppDataSource.getRepository(MaquinaCliente);
    
    return await repo.find({
      where: { maquina: { id: maquinaId } },
      relations: ["cliente"],
      order: { fecha_asignacion: "DESC" }
    });
  }
}