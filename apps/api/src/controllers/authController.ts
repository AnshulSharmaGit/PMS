import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../store';
import { User, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const existingUser = db.findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role && Object.values(Role).includes(role) ? role : Role.CUSTOMER;

        const user = db.createUser({
            email,
            password: hashedPassword,
            name,
            role: userRole,
            permissions: []
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password required' });
            return;
        }

        const user = db.findUserByEmail(email);
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
