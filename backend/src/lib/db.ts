import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuario } from "../entities/Usuario";
import { Proveedor } from "@/entities/proveedor";
import { Repuesto } from "@/entities/Repuesto";

// Validar variables de entorno requeridas
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno ${envVar} no está definida`);
  }
}

console.log('Configurando conexión a PostgreSQL con:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  // No loguear password por seguridad
});

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [Usuario, Proveedor, Repuesto],
  extra: {
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },
  poolSize: 10,
  connectTimeoutMS: 30000,
});

let isInitialized = false;

export async function initializeDatabase() {
  try {
    if (!isInitialized && !AppDataSource.isInitialized) {
      console.log("Inicializando conexión a PostgreSQL...");
      await AppDataSource.initialize();
      isInitialized = true;
      console.log("✅ Conexión a PostgreSQL establecida correctamente");
    }
    return AppDataSource;
  } catch (error) {
    console.error("❌ Error al conectar con PostgreSQL:", error);
    
    // Información detallada para debugging
    if (error instanceof Error) {
      console.error("Mensaje completo:", error.message);
    }
    
    // Verificar que podemos acceder a las variables (sin mostrar password)
    console.log("Configuración usada:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      database: process.env.DB_NAME,
      hasPassword: !!process.env.DB_PASSWORD
    });
    
    throw error;
  }
}

export async function getDatabaseConnection() {
  return await initializeDatabase();
}