import { Request, Response } from 'express';
import { db } from '../store';

/**
 * Get Medicines Controller
 * 
 * Retrieves the full list of medicines from the inventory.
 * 
 * @param req - Express Request object
 * @param res - Express Response object (returns Medicine[])
 */
export const getMedicines = (req: Request, res: Response): void => {
    try {
        const medicines = db.getAllMedicines();
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

/**
 * Create Medicine Controller
 * 
 * Adds a new medicine to the inventory.
 * Validates that Name and MRP are provided.
 * 
 * @param req - Express Request object containing medicine details
 * @param res - Express Response object
 */
export const createMedicine = (req: Request, res: Response): void => {
    try {
        const { name, manufacturer, batchNumber, expiryDate, mrp, stock } = req.body;

        // Basic validation
        if (!name || !mrp) {
            res.status(400).json({ message: 'Name and MRP are required' });
            return;
        }

        const medicine = db.createMedicine({
            name,
            manufacturer,
            batchNumber,
            expiryDate: new Date(expiryDate),
            mrp,
            stock: stock || 0
        });

        res.status(201).json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
