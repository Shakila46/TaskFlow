import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/utils/prisma.js';

describe('Task Endpoints', () => {
  let adminToken: string;
  let pmToken: string;
  let leaderToken: string;
  let memberToken: string;
  let otherMemberToken: string;
  let seededProjectId: number;
  let seededTaskId: number;

  beforeAll(async () => {
    const login = async (email: string) => {
      const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
      return res.body.token;
    };

    adminToken = await login('admin@test.com');
    pmToken = await login('pm@test.com');
    leaderToken = await login('leader@test.com');
    memberToken = await login('member@test.com');

    // Create another member to test "only update own task" logic
    await request(app).post('/api/auth/register').send({
      name: 'Other Member',
      email: 'othermem@test.com',
      password: 'password123',
    });
    otherMemberToken = await login('othermem@test.com');

    const project = await prisma.project.findFirst({ where: { title: 'Test Project' } });
    seededProjectId = project!.id;

    const task = await prisma.task.findFirst({ where: { title: 'Test Task' } });
    seededTaskId = task!.id;
  });

  describe('POST /api/tasks', () => {
    it('should allow owning PM to create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          title: 'New PM Task',
          description: 'Desc',
          projectId: seededProjectId
        });

      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe('New PM Task');
    });

    it('should deny TEAM_MEMBER from creating a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Member Task',
          projectId: seededProjectId
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for ADMIN', async () => {
      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return assigned/project tasks for TEAM_MEMBER', async () => {
      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      const found = res.body.find((t: any) => t.title === 'Test Task');
      expect(found).toBeDefined();
    });
  });

  describe('PATCH /api/tasks/:taskId/status', () => {
    it('should allow TEAM_MEMBER to update their own assigned task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${seededTaskId}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('IN_PROGRESS');
    });

    it('should deny TEAM_MEMBER from updating unassigned task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${seededTaskId}/status`)
        .set('Authorization', `Bearer ${otherMemberToken}`)
        .send({ status: 'DONE' });

      expect(res.status).toBe(403);
    });

    it('should allow TEAM_LEADER (in project) to update any task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${seededTaskId}/status`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .send({ status: 'DONE' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('DONE');
    });
  });

  describe('PUT /api/tasks/:taskId', () => {
    it('should allow owning PM to full update task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${seededTaskId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ title: 'Updated PM Task', priority: 'HIGH' });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe('Updated PM Task');
    });

    it('should deny TEAM_LEADER from full update', async () => {
      const res = await request(app)
        .put(`/api/tasks/${seededTaskId}`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .send({ title: 'Leader Updated' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:taskId', () => {
    it('should deny TEAM_MEMBER from deleting task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${seededTaskId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow owning PM to delete task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${seededTaskId}`)
        .set('Authorization', `Bearer ${pmToken}`);

      expect(res.status).toBe(200);
    });
  });
});
