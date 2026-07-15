import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly load .env from backend root
dotenv.config({ path: resolve(__dirname, '../../.env') });

const isTest = process.env.NODE_ENV === 'test';
const connectionString = (isTest ? process.env['DATABASE_URL_TEST'] : process.env['DATABASE_URL']) ?? '';
const prisma = new PrismaClient({
  datasourceUrl: connectionString,
});

export default prisma;
