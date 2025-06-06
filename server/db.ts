import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with better error handling and timeout settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // Increased timeout
  idleTimeoutMillis: 30000,
  max: 5, // Reduced max connections for serverless
  maxUses: 7500, // Add max uses to prevent stale connections
  allowExitOnIdle: true // Allow pool to exit when idle
});

// Add error handling for pool
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle({ client: pool, schema });

// Test connection function
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}