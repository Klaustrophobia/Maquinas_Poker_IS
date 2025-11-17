// repositories/MaquinaClienteRepository.ts
import { AppDataSource } from '@/lib/db';
import { MaquinaCliente } from '@/entities/MaquinaCliente';

export const MaquinaClienteRepository = AppDataSource.getRepository(MaquinaCliente);

export const findByClienteId = async (clienteId: number) => {
  return await MaquinaClienteRepository.find({
    where: { cliente: { id: clienteId } },
    relations: ['maquina'],
  });
};
