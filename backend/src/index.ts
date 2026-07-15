import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running correctly on Vercel!' });
});

import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

app.get('/api/create-tables', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query(`
      DROP TABLE IF EXISTS "ProjectMember" CASCADE;
      DROP TABLE IF EXISTS "Task" CASCADE;
      DROP TABLE IF EXISTS "Project" CASCADE;
      DROP TABLE IF EXISTS "User" CASCADE;
      DROP TABLE IF EXISTS "_TaskDependencies" CASCADE;
      DROP TYPE IF EXISTS "Role" CASCADE;
      DROP TYPE IF EXISTS "Status" CASCADE;
      DROP TYPE IF EXISTS "Priority" CASCADE;
      DROP TYPE IF EXISTS "TaskStatus" CASCADE;
      DROP TYPE IF EXISTS "TaskPriority" CASCADE;

      DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROJECT_SPONSOR'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH'); EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE TABLE "User" (
          "id" SERIAL NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "password" TEXT NOT NULL,
          "role" "Role" NOT NULL DEFAULT 'TEAM_MEMBER', "designation" TEXT, "resetPasswordToken" TEXT, "resetPasswordExpires" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

      CREATE TABLE "Project" (
          "id" SERIAL NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "startDate" TIMESTAMP(3), "endDate" TIMESTAMP(3),
          "budget" DOUBLE PRECISION, "scope" TEXT, "goals" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL, "managerId" INTEGER NOT NULL, CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE "ProjectMember" (
          "projectId" INTEGER NOT NULL, "userId" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("projectId", "userId")
      );

      CREATE TABLE "Task" (
          "id" SERIAL NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
          "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM', "dueDate" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL, "projectId" INTEGER NOT NULL, "assigneeId" INTEGER, CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE "_TaskDependencies" ("A" INTEGER NOT NULL, "B" INTEGER NOT NULL);
      CREATE UNIQUE INDEX "_TaskDependencies_AB_unique" ON "_TaskDependencies"("A", "B");
      CREATE INDEX "_TaskDependencies_B_index" ON "_TaskDependencies"("B");

      ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      ALTER TABLE "_TaskDependencies" ADD CONSTRAINT "_TaskDependencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "_TaskDependencies" ADD CONSTRAINT "_TaskDependencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    client.release();
    res.json({ success: true, message: 'Tables fully created and synced!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});
import prisma from './utils/prisma.js';
import bcrypt from 'bcryptjs';

app.get('/api/seed', async (req, res) => {
  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return res.json({ message: 'Dummy data already exists!' });
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create Dummy Users
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@cyphlab.com',
        password: hashedPassword,
        role: 'ADMIN',
        designation: 'System Administrator'
      }
    });

    const manager = await prisma.user.create({
      data: {
        name: 'Project Manager',
        email: 'manager@cyphlab.com',
        password: hashedPassword,
        role: 'PROJECT_MANAGER',
        designation: 'Senior Manager'
      }
    });

    const member = await prisma.user.create({
      data: {
        name: 'Team Member',
        email: 'user@cyphlab.com',
        password: hashedPassword,
        role: 'TEAM_MEMBER',
        designation: 'Frontend Developer'
      }
    });

    // Create a Dummy Project
    const project = await prisma.project.create({
      data: {
        title: 'CyphLab Rebranding',
        description: 'Complete redesign of CyphLab website and assets.',
        managerId: manager.id,
        members: {
          create: [
            { userId: manager.id },
            { userId: member.id }
          ]
        }
      }
    });

    // Create some Tasks
    await prisma.task.createMany({
      data: [
        {
          title: 'Design UI Mockups',
          description: 'Create Figma mockups for the new homepage',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          projectId: project.id,
          assigneeId: member.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Setup Database',
          description: 'Configure Supabase and Prisma schema',
          status: 'DONE',
          priority: 'HIGH',
          projectId: project.id,
          assigneeId: admin.id
        }
      ]
    });

    res.json({ success: true, message: 'Dummy data added successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/api/debug-users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
