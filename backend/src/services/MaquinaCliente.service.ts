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

    const cliente = await usuarioRepo.findOneBy({ id: clienteId });
    if (!cliente) throw new Error("Cliente no encontrado");

    const maquina = await maquinaRepo.findOneBy({ id: maquinaId });
    if (!maquina) throw new Error("Máquina no encontrada");

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
}
