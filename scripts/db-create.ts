import { Client } from 'pg';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

// Load env (supports NODE_ENV specific files as in app.module.ts)
loadEnv({ path: resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });
loadEnv();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'postgres';

async function ensureDatabase(): Promise<void> {
  const adminClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'postgres',
  });
  try {
    await adminClient.connect();
    const res = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
    if (res.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database ${DB_NAME} created.`);
    } else {
      console.log(`Database ${DB_NAME} already exists.`);
    }
  } catch (err) {
    console.error('Failed to ensure database:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await adminClient.end().catch(() => undefined);
  }
}

ensureDatabase();


