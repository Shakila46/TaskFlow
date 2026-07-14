import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/utils/prisma.js';
import bcrypt from 'bcryptjs';

describe('User Endpoints', () => {
  let adminToken: string;
  let memberToken: string;
  let targetUserId: number;

  beforeAll(async () => {
    const login = async (email: string) => {
      const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
      return res.body.token;
    };

    adminToken = await login('admin@test.com');
    memberToken = await login('member@test.com');

    // Create a target user to test CRUD operations
    const hashed = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: { name: 'Target User', email: 'target@test.com', password: hashed, role: 'TEAM_MEMBER' }
    });
    targetUserId = user.id;
  });

  describe('GET /api/users', () => {
    it('should allow ADMIN to get all users', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should deny TEAM_MEMBER from getting users', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should deny TEAM_MEMBER from updating a user', async () => {
      const res = await request(app)
        .patch(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ role: 'PROJECT_MANAGER' });
      
      expect(res.status).toBe(403);
    });

    it('should allow ADMIN to update a user role', async () => {
      const res = await request(app)
        .patch(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'PROJECT_MANAGER' });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('PROJECT_MANAGER');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should deny TEAM_MEMBER from deleting a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${memberToken}`);
      
      expect(res.status).toBe(403);
    });

    it('should allow ADMIN to delete a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify deletion
      const deletedUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      expect(deletedUser).toBeNull();
    });
  });
});
