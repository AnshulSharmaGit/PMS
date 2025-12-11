import { Router } from 'express';
import { getUsers, updatePermissions, deleteUser } from '../controllers/userController';

const router = Router();

// In a real app, add middleware to check if requester is ADMIN
router.get('/', getUsers);
router.put('/:id/permissions', updatePermissions);
router.delete('/:id', deleteUser);

export default router;
