import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', 
  testEnvironment: 'node', 
  rootDir: '.', 
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  clearMocks: true,

  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  verbose: true,
};

export default config;
