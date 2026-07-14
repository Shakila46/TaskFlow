import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/utils/prisma.js';

describe('Project Endpoints', () => {
  let adminToken: string;
  let pmToken: string;
  let memberToken: string;
  let otherPmToken: string;
  let seededProjectId: number;
  let memberId: number;

  beforeAll(async () => {
    // Get tokens for seeded users
    const login = async (email: string) => {
      const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
      return res.body.token;
    };

    adminToken = await login('admin@test.com');
    pmToken = await login('pm@test.com');
    memberToken = await login('member@test.com');

    // Create another PM to test "not owning manager" logic
    const otherPmRes = await request(app).post('/api/auth/register').send({
      name: 'Other PM',
      email: 'otherpm@test.com',
      password: 'password123',
      role: 'PROJECT_MANAGER'
    });
    // Manually set role to PM since register defaults to TEAM_MEMBER for subsequent users
    await prisma.user.update({
      where: { email: 'otherpm@test.com' },
      data: { role: 'PROJECT_MANAGER' }
    });
    otherPmToken = await login('otherpm@test.com');

    const project = await prisma.project.findFirst({ where: { title: 'Test Project' } });
    seededProjectId = project!.id;

    const member = await prisma.user.findUnique({ where: { email: 'member@test.com' } });
    memberId = member!.id;
  });

  describe('POST /api/projects', () => {
    it('should allow PM to create a project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          title: 'New PM Project',
          description: 'Desc',
        });

      expect(res.status).toBe(201);
      expect(res.body.project.title).toBe('New PM Project');
    });

    it('should deny TEAM_MEMBER from creating a project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Member Project' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/projects', () => {
    it('should return all projects for ADMIN', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should only return managed projects for PM', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${otherPmToken}`);

      expect(res.status).toBe(200);
      // otherPm hasn't created any projects yet
      expect(res.body.length).toBe(0);
    });

    it('should only return assigned projects for TEAM_MEMBER', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      // Member is assigned to the seeded "Test Project"
      const found = res.body.find((p: any) => p.id === seededProjectId || p.title === 'Test Project');
      expect(found).toBeDefined();
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should allow owning PM to update project', async () => {
      const res = await request(app)
        .put(`/api/projects/${seededProjectId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ title: 'Updated Test Project' });

      expect(res.status).toBe(200);
      expect(res.body.project.title).toBe('Updated Test Project');
    });

    it('should allow ADMIN to update any project', async () => {
      const res = await request(app)
        .put(`/api/projects/${seededProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Updated Project' });

      expect(res.status).toBe(200);
      expect(res.body.project.title).toBe('Admin Updated Project');
    });

    it('should deny non-owning PM from updating project', async () => {
      const res = await request(app)
        .put(`/api/projects/${seededProjectId}`)
        .set('Authorization', `Bearer ${otherPmToken}`)
        .send({ title: 'Hacked Project' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/projects/:id/members', () => {
    it('should allow owning PM to add a member', async () => {
      // Need a new user to add
      const newUser = await prisma.user.create({
        data: { name: 'New Mem', email: 'newmem@test.com', password: 'pw', role: 'TEAM_MEMBER' }
      });

      const res = await request(app)
        .post(`/api/projects/${seededProjectId}/members`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ userId: newUser.id });

      expect(res.status).toBe(200);
    });

    it('should deny non-owning PM from adding a member', async () => {
      const res = await request(app)
        .post(`/api/projects/${seededProjectId}/members`)
        .set('Authorization', `Bearer ${otherPmToken}`)
        .send({ userId: memberId });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should deny non-owning PM from deleting project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${seededProjectId}`)
        .set('Authorization', `Bearer ${otherPmToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow owning PM to delete project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${seededProjectId}`)
        .set('Authorization', `Bearer ${pmToken}`);

      expect(res.status).toBe(200);
    });
  });

});
