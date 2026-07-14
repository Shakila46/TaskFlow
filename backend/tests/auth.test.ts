import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/utils/prisma.js';

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'New Auth User',
    email: `auth_${Date.now()}@test.com`,
    password: 'password123',
    role: 'TEAM_MEMBER',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail if user already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/forgot-password and reset-password', () => {
    let resetToken = '';

    it('should generate a reset token on forgot-password', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      // In dev mode, our controller returns the token if email fails to send
      // If email succeeded, we wouldn't easily get the token in tests unless we mock sendEmail
      // For testing, let's query the DB directly to get the token
      const user = await prisma.user.findUnique({ where: { email: testUser.email } });
      expect(user?.resetPasswordToken).not.toBeNull();
      resetToken = user!.resetPasswordToken!;
    });

    it('should fail to reset with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid_token', password: 'newpassword123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid or expired token');
    });

    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: resetToken, password: 'newpassword123' });

      expect(res.status).toBe(200);

      // Verify token is cleared
      const user = await prisma.user.findUnique({ where: { email: testUser.email } });
      expect(user?.resetPasswordToken).toBeNull();
      
      // Verify login works with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'newpassword123',
        });
      expect(loginRes.status).toBe(200);
    });
  });
});
