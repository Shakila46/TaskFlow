import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const validRoles = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'PROJECT_SPONSOR'];
    const userRole = validRoles.includes(role) ? role : 'TEAM_MEMBER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole as any,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { role, designation } = req.body;

    const validRoles = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROJECT_SPONSOR'];
    
    let updateData: any = {};
    if (role) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      updateData.role = role as any;
    }
    
    if (designation !== undefined) {
      updateData.designation = designation;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Prevent deleting the main admin user to avoid locking out (assuming ID 1 is the main admin, or just generally delete any)
    // Here we'll just allow it but we could add a check if needed.

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
