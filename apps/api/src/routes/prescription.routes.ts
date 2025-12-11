import { Router } from 'express';
import { createPrescription, getPrescriptions, fulfillPrescription } from '../controllers/prescriptionController';

const router = Router();

router.post('/', createPrescription);
router.get('/', getPrescriptions);
router.put('/:id/fulfill', fulfillPrescription);

export default router;
