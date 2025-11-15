import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // Usa ts-jest para compilar TypeScript al volar
  testEnvironment: 'node', // Ideal para proyectos backend / Node.js
  rootDir: '.', // Carpeta raíz del proyecto
  roots: ['<rootDir>/src'], // Dónde buscar los tests
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // 🧭 Mapea los alias del tsconfig (por ejemplo "@/services/...")
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 🧹 Ignora la carpeta de build y node_modules
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // 📦 Limpia mocks entre pruebas
  clearMocks: true,

  // 📜 Transforma archivos .ts con ts-jest
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  // 🧩 Opcional: muestra más información si un test falla
  verbose: true,
};

export default config;
