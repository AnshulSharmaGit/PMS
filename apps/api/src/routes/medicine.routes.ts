import { Router } from 'express';
import { getMedicines, createMedicine } from '../controllers/medicineController';

const router = Router();

router.get('/', getMedicines);
router.post('/', createMedicine);

export default router;
