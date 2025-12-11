import { Router } from 'express';
import { createTransaction, getTransactions } from '../controllers/billingController';

const router = Router();

router.post('/', createTransaction);
router.get('/', getTransactions);

export default router;
