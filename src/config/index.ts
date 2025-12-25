import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Central configuration object
 * All environment variables are accessed through this config
 */
const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // AI Provider
  aiProvider: process.env.AI_PROVIDER || 'mock',
  geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY || '',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // File upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
} as const;

export default config;
