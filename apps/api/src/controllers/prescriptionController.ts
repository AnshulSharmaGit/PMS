import { Request, Response } from 'express';
import { db } from '../store';
import { PrescriptionItem } from '../types';

export const createPrescription = (req: Request, res: Response): void => {
    try {
        const { patientName, doctorName, items } = req.body;

        if (!patientName || !doctorName || !items || items.length === 0) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Validate medicines exist and check stock (simple check)
        // In real app, we would deduct stock here or upon fulfillment

        const prescription = db.createPrescription({
            patientName,
            doctorName,
            items: items as PrescriptionItem[],
            status: 'PENDING'
        });

        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const getPrescriptions = (req: Request, res: Response): void => {
    try {
        const prescriptions = db.getAllPrescriptions();
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const fulfillPrescription = (req: Request, res: Response): void => {
    try {
        const { id } = req.params;
        const prescription = db.fulfillPrescription(Number(id));

        if (!prescription) {
            res.status(404).json({ message: 'Prescription not found' });
            return;
        }

        // Deduct stock here in a real scenario

        res.json(prescription);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
