import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, projectId, assigneeId, dueDate, priority, dependencyIds } = req.body;
    const currentUserId = req.user!.userId;
    const role = req.user!.role;

    // Check project exists
    const project = await prisma.project.findUnique({ where: { id: parseInt(projectId) } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only Admin or the PM of the project can create tasks for it
    if (role !== 'ADMIN' && project.managerId !== currentUserId) {
      return res.status(403).json({ message: 'Forbidden. You do not manage this project.' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId: parseInt(projectId),
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        dependencies: dependencyIds && Array.isArray(dependencyIds) && dependencyIds.length > 0 ? {
          connect: dependencyIds.map((id: any) => ({ id: parseInt(id) }))
        } : undefined
      } as any,
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    let tasks;

    if (role === 'ADMIN') {
      tasks = await prisma.task.findMany({
        include: { project: { select: { title: true } }, assignee: { select: { name: true } }, dependencies: { select: { id: true } } } as any,
      });
    } else if (role === 'PROJECT_MANAGER') {
      tasks = await prisma.task.findMany({
        where: {
          project: { managerId: userId },
        },
        include: { project: { select: { title: true } }, assignee: { select: { name: true } }, dependencies: { select: { id: true } } } as any,
      });
    } else if (role === 'PROJECT_SPONSOR') {
      tasks = await prisma.task.findMany({
        include: { project: { select: { title: true } }, assignee: { select: { name: true } }, dependencies: { select: { id: true } } } as any,
      });
    } else {
      // TEAM_MEMBER and TEAM_LEADER
      tasks = await prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: userId },
            { project: { members: { some: { userId } } } },
            { project: { tasks: { some: { assigneeId: userId } } } }
          ]
        },
        include: { project: { select: { title: true } }, assignee: { select: { name: true, designation: true } }, dependencies: { select: { id: true } } } as any,
      });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.taskId as string;
    const { status } = req.body;
    const { userId, role } = req.user!;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Permission check
    // Admin can update anything
    // PM can update tasks in their project
    // Team Leader can update any task in a project they are part of
    // Team member can only update tasks assigned to them
    let canUpdate = false;
    if (role === 'ADMIN') {
      canUpdate = true;
    } else if (role === 'PROJECT_MANAGER' && task.project.managerId === userId) {
      canUpdate = true;
    } else if (role === 'TEAM_LEADER') {
      // Check if team leader is part of the project
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId }
      });
      if (isMember || task.assigneeId === userId) canUpdate = true;
    } else if (role === 'TEAM_MEMBER' && task.assigneeId === userId) {
      canUpdate = true;
    }

    if (!canUpdate) {
      return res.status(403).json({ message: 'Forbidden. You cannot update this task.' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status },
    });

    res.status(200).json({ message: 'Task status updated', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.taskId as string;
    const { title, description, assigneeId, dueDate, priority, status, dependencyIds } = req.body;
    const { userId, role } = req.user!;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: { project: true },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only Admin and the PM of the task's project can do full updates
    if (role !== 'ADMIN' && task.project.managerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: {
        title,
        description,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status,
        dependencies: Array.isArray(dependencyIds) ? {
          set: dependencyIds.map((id: any) => ({ id: parseInt(id) }))
        } : undefined
      } as any,
    });

    res.json({ message: 'Task updated', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.taskId as string;
    const { userId, role } = req.user!;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: { project: true },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (role !== 'ADMIN' && task.project.managerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.task.delete({ where: { id: parseInt(taskId) } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
