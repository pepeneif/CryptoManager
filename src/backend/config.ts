// Centralized configuration for backend
// Loads from environment variables with sensible defaults

export const config = {
  // Server
  PORT: Number(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'manager-io-crypto-secret-key-2024',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || './data/manager.db',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
}

// Validate required config in production
if (config.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  Warning: JWT_SECRET not set. Using default secret - not recommended for production!')
  }
}
