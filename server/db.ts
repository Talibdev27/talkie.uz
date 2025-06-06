import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 5000,
  max: 3,
  ssl: process.env.NODE_ENV === 'production'
});

export const db = drizzle({ client: pool, schema });

// Test connection on module load with timeout
const testConnection = async () => {
  try {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    );
    
    const connectionTest = pool.query('SELECT 1');
    await Promise.race([connectionTest, timeout]);
    console.log('Database connection established');
  } catch (error) {
    console.warn('Database connection warning:', error);
    // Don't throw - allow server to start and handle DB errors gracefully
  }
};

testConnection();