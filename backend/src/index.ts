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

import prisma from './utils/prisma.js';
import bcrypt from 'bcryptjs';

app.get('/api/seed', async (req, res) => {
  try {
    // Clean up existing dummy data
    await prisma.task.deleteMany({});
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        NOT: { email: 'shakilapraween46@gmail.com' }
      }
    });

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create Dummy Users with CORRECT designations from the UI
    const usersData = [
      { name: 'Admin User', email: 'admin@cyphlab.com', password: hashedPassword, role: 'ADMIN', designation: 'Tech Lead / Software Architect' },
      { name: 'Project Manager', email: 'manager@cyphlab.com', password: hashedPassword, role: 'PROJECT_MANAGER', designation: 'Business Analyst (BA)' },
      { name: 'Team Leader', email: 'leader@cyphlab.com', password: hashedPassword, role: 'TEAM_LEADER', designation: 'Fullstack Engineer' },
      { name: 'Frontend Dev', email: 'frontend@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'Front-end Engineer' },
      { name: 'Backend Dev', email: 'backend@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'Back-end Engineer' },
      { name: 'UI Designer', email: 'ui@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'UX/UI Designer' },
    ];

    const createdUsers = [];
    for (const u of usersData) {
       createdUsers.push(await prisma.user.create({ data: u as any }));
    }

    const [admin, manager, leader, frontend, backend, ui] = createdUsers;

    // Create Projects
    const project1 = await prisma.project.create({
      data: {
        title: 'CyphLab Web App v2',
        description: 'Complete overhaul of the main web application.',
        managerId: manager.id,
        members: {
          create: [{ userId: manager.id }, { userId: leader.id }, { userId: frontend.id }, { userId: backend.id }, { userId: ui.id }]
        }
      }
    });

    const project2 = await prisma.project.create({
      data: {
        title: 'Mobile App API',
        description: 'REST API for the upcoming mobile application.',
        managerId: manager.id,
        members: {
          create: [{ userId: manager.id }, { userId: leader.id }, { userId: backend.id }]
        }
      }
    });

    // Create 15 Dummy Tasks
    const allUsers = [admin, manager, leader, frontend, backend, ui];
    const tasksData = [];
    for (let i = 1; i <= 15; i++) {
       const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
       const priorities = ['LOW', 'MEDIUM', 'HIGH'];
       const p = i <= 8 ? project1 : project2;
       
       tasksData.push({
          title: `Development Task ${i}`,
          description: `Comprehensive description for development task ${i}. Requires immediate attention.`,
          status: statuses[i % 3] as any,
          priority: priorities[i % 3] as any,
          projectId: p.id,
          assigneeId: allUsers[i % allUsers.length].id,
          dueDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
       });
    }
    await prisma.task.createMany({ data: tasksData });

    res.json({ success: true, message: 'Comprehensive Dummy Data created successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/api/seed-dependencies', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { id: 'asc' } });
    if (tasks.length < 5) return res.json({ message: 'Not enough tasks to create dependencies' });

    // Link task 1 -> 2, 2 -> 3, 3 -> 4, 1 -> 5
    await prisma.task.update({ where: { id: tasks[1].id }, data: { dependsOn: { connect: [{ id: tasks[0].id }] } } });
    await prisma.task.update({ where: { id: tasks[2].id }, data: { dependsOn: { connect: [{ id: tasks[1].id }] } } });
    await prisma.task.update({ where: { id: tasks[3].id }, data: { dependsOn: { connect: [{ id: tasks[2].id }] } } });
    await prisma.task.update({ where: { id: tasks[4].id }, data: { dependsOn: { connect: [{ id: tasks[0].id }] } } });
    
    // Some links for project 2 tasks (around index 8+)
    if (tasks.length > 10) {
      await prisma.task.update({ where: { id: tasks[9].id }, data: { dependsOn: { connect: [{ id: tasks[8].id }] } } });
      await prisma.task.update({ where: { id: tasks[10].id }, data: { dependsOn: { connect: [{ id: tasks[9].id }] } } });
    }

    res.json({ success: true, message: 'Dependencies linked successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
