import prisma from '../src/utils/prisma.js';
import { execSync } from 'child_process';
import bcrypt from 'bcryptjs';
import { jest } from '@jest/globals';

jest.setTimeout(30000);

beforeAll(async () => {
  // Ensure we are using the test database
  if (!process.env.DATABASE_URL_TEST) {
    throw new Error('DATABASE_URL_TEST is not defined in environment variables');
  }

  // Push schema directly to test DB (bypasses missing migration files)
  execSync('npx prisma db push --force-reset --accept-data-loss', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL_TEST,
    },
    stdio: 'inherit',
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed Roles
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@test.com', password: hashedPassword, role: 'ADMIN' },
  });
  
  const pm = await prisma.user.create({
    data: { name: 'PM User', email: 'pm@test.com', password: hashedPassword, role: 'PROJECT_MANAGER' },
  });
  
  const leader = await prisma.user.create({
    data: { name: 'Team Leader', email: 'leader@test.com', password: hashedPassword, role: 'TEAM_LEADER' },
  });
  
  const member = await prisma.user.create({
    data: { name: 'Team Member', email: 'member@test.com', password: hashedPassword, role: 'TEAM_MEMBER' },
  });
  
  const sponsor = await prisma.user.create({
    data: { name: 'Sponsor User', email: 'sponsor@test.com', password: hashedPassword, role: 'PROJECT_SPONSOR' },
  });

  // Seed 1 Project
  const project = await prisma.project.create({
    data: {
      title: 'Test Project',
      description: 'A test project',
      managerId: pm.id,
      members: {
        create: [
          { userId: pm.id },
          { userId: leader.id },
          { userId: member.id },
        ],
      },
    },
  });

  // Seed 1 Task
  await prisma.task.create({
    data: {
      title: 'Test Task',
      description: 'A test task',
      status: 'TODO',
      priority: 'HIGH',
      projectId: project.id,
      assigneeId: member.id,
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
