import { Router } from 'express';
import { createProject, getProjects, assignMember, updateProject, deleteProject } from '../controllers/projectController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest, projectSchema } from '../middleware/validate.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Get all projects the user has access to
router.get('/', getProjects);

// Only Admin and PM can create projects
router.post('/', requireRole(['ADMIN', 'PROJECT_MANAGER']), validateRequest(projectSchema), createProject);

// Only Admin and PM can update/delete projects
router.put('/:id', requireRole(['ADMIN', 'PROJECT_MANAGER']), validateRequest(projectSchema), updateProject);
router.delete('/:id', requireRole(['ADMIN', 'PROJECT_MANAGER']), deleteProject);

// Only Admin and PM can assign members to projects
router.post('/:projectId/members', requireRole(['ADMIN', 'PROJECT_MANAGER']), assignMember);

export default router;
