import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Usuario } from "@/entities/Usuario";
import { Proveedor } from "@/entities/Proveedor";
import { Repuesto } from "@/entities/Repuesto";
import { Maquina } from '@/entities/Maquina';
import { MaquinaCliente } from '@/entities/MaquinaCliente';
import { Recibo } from '@/entities/Recibo';
import { LoteRecibo } from '@/entities/LoteRecibo';
import { RepuestoUtilizado } from '@/entities/RepuestoUtilizado';
import { SolicitudReparacion } from '@/entities/SolicitudReparacion';
import { Notificacion } from '@/entities/Notificacion';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '1234',
  database: process.env.DB_NAME || 'Maquinas_Poker',
  synchronize: false,
  entities: [
    Usuario, 
    Proveedor, 
    Repuesto, 
    Maquina, 
    MaquinaCliente, 
    Recibo, 
    LoteRecibo, 
    RepuestoUtilizado, 
    SolicitudReparacion, 
    Notificacion
  ],
  logging: ["error", "warn"],
  extra: {
    max: 20,
    connectionTimeoutMillis: 10000,
  }
});

export const initializeDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      console.log('🔧 Intentando conectar a la base de datos...');
      console.log('📊 Configuración:', {
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'Maquinas_Poker'
      });
      
      await AppDataSource.initialize();
      console.log('✅ Base de datos conectada correctamente');
      
      // Verificar que las tablas existen
      const tables = await AppDataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('📋 Tablas disponibles:', tables.map((t: any) => t.table_name));
      
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error);
      throw error;
    }
  }
  return AppDataSource;
};

export async function getDatabaseConnection() {
  return await initializeDatabase();
}