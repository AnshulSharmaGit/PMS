import { Request, Response } from 'express';
import { db } from '../store';

export const getUsers = (req: Request, res: Response): void => {
    try {
        // In a real app, ensure to sanitize passwords out
        const users = db.getAllUsers().map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            permissions: u.permissions || [],
            createdAt: u.createdAt
        }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePermissions = (req: Request, res: Response): void => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        const user = db.updateUserPermissions(Number(id), permissions);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ message: 'Permissions updated', user: { ...user, password: '' } });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const deleteUser = (req: Request, res: Response): void => {
    try {
        const { id } = req.params;
        const deleted = db.deleteUser(Number(id));

        if (!deleted) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
