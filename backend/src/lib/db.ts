import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Usuario } from "@/entities/Usuario";
import { Proveedor } from "@/entities/Proveedor";
import { Repuesto } from "@/entities/Repuesto";
import { Maquina } from '@/entities/Maquina';
import { MaquinaCliente } from '@/entities/MaquinaCliente';
import { Recibo } from '@/entities/Recibo';
import { LoteRecibo } from '@/entities/LoteRecibo';
import { SolicitudReparacion } from '@/entities/SolicitudReparacion';
import { Notificacion } from '@/entities/Notificacion';
import { RepuestoUtilizado } from '@/entities/RepuestoUtilizado';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'prueba',
  database: process.env.DB_NAME || 'Maquinas_Poker',
  synchronize: false,
  entities: [Usuario, Proveedor, Repuesto, Maquina, MaquinaCliente, Recibo, LoteRecibo, SolicitudReparacion, Notificacion, RepuestoUtilizado],
  logging: ["error", "warn"],
});

export const initializeDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};

export async function getDatabaseConnection() {
  return await initializeDatabase();
}