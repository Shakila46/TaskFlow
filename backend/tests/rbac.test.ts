import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/utils/prisma.js';

describe('RBAC Matrix', () => {
  const tokens: Record<string, string> = {};
  const roles = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROJECT_SPONSOR'];
  let seededProjectId: number;
  let seededTaskId: number;

  beforeAll(async () => {
    // We expect jest.setup.ts to have seeded users with these exact emails
    const roleEmails: Record<string, string> = {
      'ADMIN': 'admin@test.com',
      'PROJECT_MANAGER': 'pm@test.com',
      'TEAM_LEADER': 'leader@test.com',
      'TEAM_MEMBER': 'member@test.com',
      'PROJECT_SPONSOR': 'sponsor@test.com',
    };

    for (const role of roles) {
      const email = roleEmails[role];
      const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
      tokens[role] = res.body.token;
    }

    const project = await prisma.project.findFirst({ where: { title: 'Test Project' } });
    seededProjectId = project!.id;

    const task = await prisma.task.findFirst({ where: { title: 'Test Task' } });
    seededTaskId = task!.id;
  });

  const expectAccess = (res: request.Response, allowed: boolean, methodName: string, url: string, role: string) => {
    if (allowed) {
      // 200, 201 are success. 400 or 404 means it passed auth but failed logic (which is fine for auth testing)
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    } else {
      try {
        expect([401, 403]).toContain(res.status);
      } catch (e) {
        throw new Error(`Expected ${role} to be forbidden on ${methodName} ${url}, but got status ${res.status}. Response: ${JSON.stringify(res.body)}`);
      }
    }
  };

  describe('Project Endpoints (POST /api/projects)', () => {
    const allowedRoles = ['ADMIN', 'PROJECT_MANAGER'];
    
    it.each(roles)('%s access to create project', async (role) => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokens[role]}`)
        .send({ title: `Matrix Project ${role}` });

      expectAccess(res, allowedRoles.includes(role), 'POST', '/api/projects', role);
    });
  });

  describe('User Endpoints (POST /api/users)', () => {
    const allowedRoles = ['ADMIN'];
    
    it.each(roles)('%s access to create user', async (role) => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokens[role]}`)
        .send({ name: 'MatUser', email: `mat_${role}@test.com`, password: 'pw' });

      expectAccess(res, allowedRoles.includes(role), 'POST', '/api/users', role);
    });
  });

  describe('Task Endpoints (PUT /api/tasks/:id)', () => {
    // Only Admin or Owning PM. 
    // Since pm@test.com is the owning PM of seeded task, they are allowed.
    // Let's create an "Other PM" who should be FORBIDDEN.
    let otherPmToken: string;

    beforeAll(async () => {
      // Register Other PM
      await request(app).post('/api/auth/register').send({
        name: 'Matrix Other PM', email: 'matrixpm@test.com', password: 'password123'
      });
      await prisma.user.update({ where: { email: 'matrixpm@test.com' }, data: { role: 'PROJECT_MANAGER' } });
      const res = await request(app).post('/api/auth/login').send({ email: 'matrixpm@test.com', password: 'password123' });
      otherPmToken = res.body.token;
    });

    const allowedRoles = ['ADMIN', 'PROJECT_MANAGER'];

    it.each(roles)('%s access to full update task', async (role) => {
      const res = await request(app)
        .put(`/api/tasks/${seededTaskId}`)
        .set('Authorization', `Bearer ${tokens[role]}`)
        .send({ title: 'Matrix Update' });

      expectAccess(res, allowedRoles.includes(role), 'PUT', '/api/tasks', role);
    });

    it('PROJECT_MANAGER (non-owning) access to full update task (Ownership test)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${seededTaskId}`)
        .set('Authorization', `Bearer ${otherPmToken}`)
        .send({ title: 'Matrix Update Hack' });

      expectAccess(res, false, 'PUT', '/api/tasks (non-owning)', 'PROJECT_MANAGER');
    });
  });
});
