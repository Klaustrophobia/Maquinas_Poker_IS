// services/MaquinaClienteService.ts
import { Usuario } from '@/entities/Usuario';
import { Maquina } from '@/entities/Maquina';
import { MaquinaCliente } from '@/entities/MaquinaCliente';
import { AppDataSource } from '@/lib/db';

const usuarioRepo = AppDataSource.getRepository(Usuario);
const maquinaRepo = AppDataSource.getRepository(Maquina);
const maquinaClienteRepo = AppDataSource.getRepository(MaquinaCliente);

export class MaquinaClienteService {
  static async asignarMaquinaACliente(clienteId: number, maquinaId: number, estado = 'Activa') {
    const cliente = await usuarioRepo.findOne({ where: { id: clienteId, rol: 'Cliente', activo: true } });
    if (!cliente) throw new Error('Cliente no encontrado o inválido');

    const maquina = await maquinaRepo.findOne({ where: { id: maquinaId } });
    if (!maquina) throw new Error('Máquina no encontrada');

    const asignacion = new MaquinaCliente();
    asignacion.cliente = cliente;
    asignacion.maquina = maquina;
    asignacion.estado = estado;

    return await maquinaClienteRepo.save(asignacion);
  }

  static async obtenerAsignacionesDeCliente(clienteId: number) {
    return await maquinaClienteRepo.find({
      where: { cliente: { id: clienteId } },
      relations: ['maquina'],
    });
  }

  static async eliminarAsignacion(clienteId: number, maquinaId: number) {
    const result = await maquinaClienteRepo.delete({
      cliente: { id: clienteId },
      maquina: { id: maquinaId },
    });
    return result;
  }
}
