import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, budget, scope, goals } = req.body;
    const userId = req.user!.userId;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
        scope,
        goals,
        managerId: userId,
      },
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    let projects;

    if (role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: { manager: { select: { name: true, email: true } } },
      });
    } else if (role === 'PROJECT_MANAGER') {
      projects = await prisma.project.findMany({
        where: { managerId: userId },
        include: { members: true, tasks: true },
      });
    } else if (role === 'PROJECT_SPONSOR') {
      projects = await prisma.project.findMany({
        where: { members: { some: { userId } } },
        include: { manager: { select: { name: true } }, tasks: true },
      });
    } else {
      // TEAM_MEMBER
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { members: { some: { userId } } },
            { tasks: { some: { assigneeId: userId } } }
          ]
        },
        include: { manager: { select: { name: true } } },
      });
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const assignMember = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const { userId } = req.body;
    const currentUserId = req.user!.userId;
    const role = req.user!.role;

    // Check if project exists
    const project = await prisma.project.findUnique({ where: { id: parseInt(projectId) } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only Admin or the PM of the project can assign members
    if (role !== 'ADMIN' && project.managerId !== currentUserId) {
      return res.status(403).json({ message: 'Forbidden. You are not the manager of this project.' });
    }

    // Check if user to assign exists
    const userToAssign = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!userToAssign) {
      return res.status(404).json({ message: 'User to assign not found' });
    }

    // Assign member
    await prisma.projectMember.create({
      data: {
        projectId: parseInt(projectId),
        userId: parseInt(userId),
      },
    });

    res.status(200).json({ message: 'Member assigned successfully' });
  } catch (error) {
    console.error('Error assigning member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, description, startDate, endDate, budget, scope, goals } = req.body;
    const { userId, role } = req.user!;

    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (role !== 'ADMIN' && project.managerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
        scope,
        goals,
      },
    });

    res.json({ message: 'Project updated', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { userId, role } = req.user!;

    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (role !== 'ADMIN' && project.managerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.project.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
