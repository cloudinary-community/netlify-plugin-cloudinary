module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config','<rootDir>/.setTestEnvVars.js'],
  testPathIgnorePatterns: ['./node_modules/', './.netlify'],
}
