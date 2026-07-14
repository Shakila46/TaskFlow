import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { validateRequest, registerSchema } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

// Get all users (Admin can see all, PM and TL can see all to assign)
router.get('/', requireRole(['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEADER']), async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
      } as any,
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Admin create user route
router.post('/', requireRole(['ADMIN']), validateRequest(registerSchema), createUser);

// Admin update user
router.patch('/:id', requireRole(['ADMIN']), updateUser);

// Admin delete user
router.delete('/:id', requireRole(['ADMIN']), deleteUser);

export default router;
