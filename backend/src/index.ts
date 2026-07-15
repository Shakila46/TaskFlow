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
      where: { NOT: { email: 'shakilapraween46@gmail.com' } }
    });

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create 15 Dummy Users with comprehensive details
    const usersData = [
      { name: 'Alice Admin', email: 'admin@cyphlab.com', password: hashedPassword, role: 'ADMIN', designation: 'Chief Technology Officer' },
      { name: 'Bob Manager', email: 'manager@cyphlab.com', password: hashedPassword, role: 'PROJECT_MANAGER', designation: 'Senior Project Manager' },
      { name: 'Charlie Leader', email: 'leader@cyphlab.com', password: hashedPassword, role: 'TEAM_LEADER', designation: 'Lead Software Engineer' },
      { name: 'David Member', email: 'david@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'Frontend Developer' },
      { name: 'Eve Member', email: 'eve@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'Backend Developer' },
      { name: 'Frank Designer', email: 'frank@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'UI/UX Designer' },
      { name: 'Grace Sponsor', email: 'grace@cyphlab.com', password: hashedPassword, role: 'PROJECT_SPONSOR', designation: 'Investor / Director' },
      { name: 'Harry Manager', email: 'harry@cyphlab.com', password: hashedPassword, role: 'PROJECT_MANAGER', designation: 'Operations Manager' },
      { name: 'Ivy Leader', email: 'ivy@cyphlab.com', password: hashedPassword, role: 'TEAM_LEADER', designation: 'QA Lead' },
      { name: 'Jack Tester', email: 'jack@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'QA Engineer' },
      { name: 'Karen DevOps', email: 'karen@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'DevOps Engineer' },
      { name: 'Leo Member', email: 'leo@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'Fullstack Developer' },
      { name: 'Mona Sponsor', email: 'mona@cyphlab.com', password: hashedPassword, role: 'PROJECT_SPONSOR', designation: 'Client Representative' },
      { name: 'Nina Data', email: 'nina@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'Data Scientist' },
      { name: 'Oscar Writer', email: 'oscar@cyphlab.com', password: hashedPassword, role: 'TEAM_MEMBER', designation: 'Technical Writer' },
    ];

    const createdUsers = [];
    for (const u of usersData) {
       createdUsers.push(await prisma.user.create({ data: u as any }));
    }

    // Extract specific users for easier assignment
    const [admin, manager1, leader1, frontend, backend, ui, sponsor1, manager2, leader2, qa, devops, fullstack, sponsor2, data, writer] = createdUsers;

    // Create 3 Comprehensive Projects
    const project1 = await prisma.project.create({
      data: {
        title: 'CyphLab Platform Redesign',
        description: 'Complete overhaul of the CyphLab platform with modern UI/UX and scalable microservices.',
        budget: 150000.00,
        scope: 'Phase 1: UI/UX, Phase 2: Frontend Implementation, Phase 3: Backend Refactoring',
        goals: 'Improve user retention by 25% and reduce server costs by 15%.',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        managerId: manager1.id,
        members: {
          create: [{ userId: manager1.id }, { userId: leader1.id }, { userId: frontend.id }, { userId: backend.id }, { userId: ui.id }, { userId: sponsor1.id }]
        }
      }
    });

    const project2 = await prisma.project.create({
      data: {
        title: 'Mobile Application Launch',
        description: 'New cross-platform mobile application for internal operations.',
        budget: 85000.00,
        scope: 'Authentication, Dashboard, Task Management features on iOS and Android.',
        goals: 'Enable remote workforce productivity and real-time syncing.',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        managerId: manager2.id,
        members: {
          create: [{ userId: manager2.id }, { userId: leader2.id }, { userId: fullstack.id }, { userId: qa.id }, { userId: devops.id }, { userId: sponsor2.id }]
        }
      }
    });

    const project3 = await prisma.project.create({
      data: {
        title: 'Data Analytics Engine',
        description: 'Real-time analytics processing engine for customer insights.',
        budget: 120000.00,
        scope: 'Data pipelines, Machine learning models, and PowerBI dashboards.',
        goals: 'Provide actionable insights within 5 minutes of customer events.',
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        managerId: manager1.id,
        members: {
          create: [{ userId: manager1.id }, { userId: leader1.id }, { userId: data.id }, { userId: devops.id }, { userId: writer.id }]
        }
      }
    });

    // Create Tasks for Project 1
    const t1 = await prisma.task.create({ data: { title: 'Design System', description: 'Create Figma design system', status: 'DONE', priority: 'HIGH', projectId: project1.id, assigneeId: ui.id, dueDate: new Date() } });
    const t2 = await prisma.task.create({ data: { title: 'Frontend Setup', description: 'Initialize Next.js project', status: 'DONE', priority: 'HIGH', projectId: project1.id, assigneeId: frontend.id, dependentOn: { connect: [{ id: t1.id }] } } });
    const t3 = await prisma.task.create({ data: { title: 'API Refactoring', description: 'Move to microservices', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: project1.id, assigneeId: backend.id, dependentOn: { connect: [{ id: t1.id }] } } });
    const t4 = await prisma.task.create({ data: { title: 'Integration Tests', description: 'Test frontend and API', status: 'TODO', priority: 'LOW', projectId: project1.id, assigneeId: leader1.id, dependentOn: { connect: [{ id: t2.id }, { id: t3.id }] } } });

    // Create Tasks for Project 2
    const t5 = await prisma.task.create({ data: { title: 'App Architecture', description: 'Define app state management', status: 'DONE', priority: 'HIGH', projectId: project2.id, assigneeId: leader2.id } });
    const t6 = await prisma.task.create({ data: { title: 'Mobile CI/CD', description: 'Setup Github actions for React Native', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: project2.id, assigneeId: devops.id } });
    const t7 = await prisma.task.create({ data: { title: 'Login Screen', description: 'Implement Auth0 login', status: 'IN_PROGRESS', priority: 'HIGH', projectId: project2.id, assigneeId: fullstack.id, dependentOn: { connect: [{ id: t5.id }] } } });
    const t8 = await prisma.task.create({ data: { title: 'QA App', description: 'Test mobile app builds', status: 'TODO', priority: 'HIGH', projectId: project2.id, assigneeId: qa.id, dependentOn: { connect: [{ id: t6.id }, { id: t7.id }] } } });

    // Create Tasks for Project 3
    const t9 = await prisma.task.create({ data: { title: 'Data Cleaning', description: 'Clean historical records', status: 'DONE', priority: 'LOW', projectId: project3.id, assigneeId: data.id } });
    const t10 = await prisma.task.create({ data: { title: 'Model Training', description: 'Train predictive model', status: 'IN_PROGRESS', priority: 'HIGH', projectId: project3.id, assigneeId: data.id, dependentOn: { connect: [{ id: t9.id }] } } });
    const t11 = await prisma.task.create({ data: { title: 'API Deployment', description: 'Deploy Flask API', status: 'TODO', priority: 'MEDIUM', projectId: project3.id, assigneeId: devops.id, dependentOn: { connect: [{ id: t10.id }] } } });
    const t12 = await prisma.task.create({ data: { title: 'Documentation', description: 'Write API docs', status: 'TODO', priority: 'LOW', projectId: project3.id, assigneeId: writer.id, dependentOn: { connect: [{ id: t11.id }] } } });

    // Seed additional unassigned / pending tasks
    await prisma.task.create({ data: { title: 'Sponsor Review (P1)', description: 'Review phase 1 deliverables', status: 'TODO', priority: 'HIGH', projectId: project1.id, assigneeId: sponsor1.id, dependentOn: { connect: [{ id: t4.id }] } } });
    await prisma.task.create({ data: { title: 'Server Audit', description: 'Audit cloud infrastructure', status: 'TODO', priority: 'MEDIUM', projectId: project1.id, assigneeId: admin.id } });
    await prisma.task.create({ data: { title: 'Client Sign-off', description: 'Final project 2 sign-off', status: 'TODO', priority: 'HIGH', projectId: project2.id, assigneeId: sponsor2.id, dependentOn: { connect: [{ id: t8.id }] } } });

    res.json({ success: true, message: 'All comprehensive dummy data (Users, Projects, Tasks, Dependencies) created successfully!' });
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
