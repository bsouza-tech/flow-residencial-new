import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config();

export function getSql() {
  const url = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL não configurada');
  }
  return neon(url);
}
