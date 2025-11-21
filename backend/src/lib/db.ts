import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Usuario } from "@/entities/Usuario";
import { Proveedor } from "@/entities/Proveedor";
import { Repuesto } from "@/entities/Repuesto";
import { Maquina } from '@/entities/Maquina';
import { MaquinaCliente } from '@/entities/MaquinaCliente';
import { Recibo } from '@/entities/Recibo';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '1234',
  database: process.env.DB_NAME || 'Maquinas_Poker',
  synchronize: false,
  entities: [Usuario, Proveedor, Repuesto, Maquina, MaquinaCliente, Recibo],
  logging: true,
});

export const initializeDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Base de datos conectada');
  }
  return AppDataSource;
};

export async function getDatabaseConnection() {
  return await initializeDatabase();
}