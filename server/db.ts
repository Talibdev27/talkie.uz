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
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 5,
  ssl: true
});

export const db = drizzle({ client: pool, schema });

// Test database connection
try {
  // Simple connection test
  pool.query('SELECT 1').then(() => {
    console.log('Database connection verified');
  }).catch((err) => {
    console.error('Database connection failed:', err.message);
  });
} catch (error) {
  console.error('Database initialization error:', error);
}

console.log('Database pool initialized');