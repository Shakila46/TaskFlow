import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus, updateTask, deleteTask } from '../controllers/taskController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest, taskSchema, taskUpdateSchema } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

// Get tasks
router.get('/', getTasks);

// Create task (Admin, PM)
router.post('/', requireRole(['ADMIN', 'PROJECT_MANAGER']), validateRequest(taskSchema), createTask);

// Update task status (for Team Members)
router.patch('/:taskId/status', updateTaskStatus);

// Full update task (Admin, PM)
router.put('/:taskId', requireRole(['ADMIN', 'PROJECT_MANAGER']), validateRequest(taskUpdateSchema), updateTask);

// Delete task (Admin, PM)
router.delete('/:taskId', requireRole(['ADMIN', 'PROJECT_MANAGER']), deleteTask);

export default router;
