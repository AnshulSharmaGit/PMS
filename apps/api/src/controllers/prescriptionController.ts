import { Request, Response } from 'express';
import { db } from '../store';
import { PrescriptionItem } from '../types';

/**
 * Create Prescription Controller
 * 
 * Allows doctors to issue new prescriptions to patients.
 * 
 * @param req - Express Request object containing patient details and medicine items.
 * @param res - Express Response object.
 */
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

/**
 * Get Prescriptions Controller
 * 
 * Retrieves all prescriptions (history) from the database.
 */
export const getPrescriptions = (req: Request, res: Response): void => {
    try {
        const prescriptions = db.getAllPrescriptions();
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

/**
 * Fulfill Prescription Controller
 * 
 * Marks a prescription as fulfilled (medicines handed over to patient).
 * Typically done by the Pharmacist.
 * 
 * @param req - Request object with prescription ID
 */
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
