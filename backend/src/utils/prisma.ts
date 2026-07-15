import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import pg from 'pg';
const { Pool } = pg;
import { PrismaPg } from '@prisma/adapter-pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly load .env from backend root and override to prevent stuck shell env vars
dotenv.config({ path: resolve(__dirname, '../../.env'), override: true });

const prisma = new PrismaClient();

export default prisma;
