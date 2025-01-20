module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/selenium/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.e2e.ts'],
  testTimeout: 60000,
  verbose: true,
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}; 