import pg from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('.env') });

const connectionString = process.env['DATABASE_URL'];

const pool = new pg.Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to database on port 6543!');
    
    // Check if enums exist
    console.log('Creating Enums...');
    await client.query(`
      DO $$ BEGIN
          CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
          CREATE TYPE "Status" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
          CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('Creating User table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT,
          "role" "Role" NOT NULL DEFAULT 'MEMBER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('Creating Index on User table...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    console.log('Creating Task table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Task" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "status" "Status" NOT NULL DEFAULT 'TODO',
          "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
          "dueDate" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT NOT NULL,
          CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('Creating Foreign Key on Task table...');
    await client.query(`
      DO $$ BEGIN
          ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    client.release();
    pool.end();
  }
}

main();
