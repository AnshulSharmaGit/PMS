import { Request, Response } from 'express';
import { db } from '../store';
import { TransactionItem } from '../types';

export const createTransaction = (req: Request, res: Response): void => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ message: 'No items in transaction' });
            return;
        }

        let totalAmount = 0;
        const itemsToSave: TransactionItem[] = [];

        // Verify stock and calculate total
        for (const item of items) {
            const med = db.getAllMedicines().find(m => m.id === item.medicineId);
            if (!med) {
                res.status(400).json({ message: `Medicine ID ${item.medicineId} not found` });
                return;
            }
            if (med.stock < item.quantity) {
                res.status(400).json({ message: `Insufficient stock for ${med.name}` });
                return;
            }

            const lineTotal = med.mrp * item.quantity;
            totalAmount += lineTotal;

            itemsToSave.push({
                medicineId: med.id,
                medicineName: med.name,
                quantity: item.quantity,
                priceCheck: med.mrp,
                total: lineTotal
            });
        }

        const transaction = db.createTransaction({
            items: itemsToSave,
            totalAmount
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const getTransactions = (req: Request, res: Response): void => {
    try {
        const transactions = db.getAllTransactions();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
