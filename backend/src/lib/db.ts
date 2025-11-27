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
  host: process.env.DB_HOST || 'poker_database',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'oracle',
  database: process.env.DB_NAME || 'Maquinas_Poker',
  synchronize: false,
  entities: [Usuario, Proveedor, Repuesto, Maquina, MaquinaCliente, Recibo, LoteRecibo, SolicitudReparacion, Notificacion, RepuestoUtilizado],
  logging: ["error", "warn"],
  extra: {
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 60000,
  }
});

// Variables globales para el estado de la conexión
let connection: DataSource | null = null;
let initializationPromise: Promise<DataSource> | null = null;

/**
 * Inicializa la conexión a la base de datos de manera segura
 * Evita múltiples inicializaciones simultáneas
 */
export const initializeDatabase = async (): Promise<DataSource> => {
  // Si ya está inicializada, retornar la conexión
  if (connection?.isInitialized) {
    return connection;
  }

  // Si hay una inicialización en curso, esperar a que termine
  if (initializationPromise) {
    return initializationPromise;
  }

  // Crear una nueva promesa de inicialización
  initializationPromise = (async (): Promise<DataSource> => {
    try {
      console.log('🔄 Inicializando conexión a la base de datos...');
      
      if (!connection) {
        connection = AppDataSource;
      }

      if (!connection.isInitialized) {
        await connection.initialize();
        console.log('✅ Conexión a la base de datos establecida exitosamente');
      } else {
        console.log('✅ Usando conexión existente a la base de datos');
      }

      return connection;
    } catch (error: any) {
      console.error('❌ Error inicializando la base de datos:', error.message);
      
      // Manejar el caso de conexión ya establecida
      if (error.message.includes('already established') || error.message.includes('already initialized')) {
        console.log('⚠️  La conexión ya estaba establecida, continuando...');
        return connection!;
      }
      
      // Resetear la promesa para permitir reintentos
      initializationPromise = null;
      throw error;
    } finally {
      // Limpiar la promesa después de un tiempo para permitir reintentos si es necesario
      setTimeout(() => {
        initializationPromise = null;
      }, 5000);
    }
  })();

  return initializationPromise;
};

/**
 * Obtiene la conexión a la base de datos
 * Siempre inicializa si no está conectado
 */
export const getDatabaseConnection = async (): Promise<DataSource> => {
  return await initializeDatabase();
};

/**
 * Verifica si la base de datos está conectada
 */
export const isDatabaseConnected = (): boolean => {
  return connection?.isInitialized || false;
};

/**
 * Cierra la conexión a la base de datos
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  if (connection?.isInitialized) {
    await connection.destroy();
    connection = null;
    initializationPromise = null;
    console.log('🔌 Conexión a la base de datos cerrada');
  }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});