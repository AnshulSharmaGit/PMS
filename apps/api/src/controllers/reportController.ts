import { Request, Response } from 'express';
import { db } from '../store';

export const getReports = (req: Request, res: Response): void => {
    try {
        const transactions = db.getAllTransactions();
        const medicines = db.getAllMedicines();

        // 1. Total Sales
        const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

        // 2. Transaction Count
        const transactionCount = transactions.length;

        // 3. Low Stock Items
        const lowStockItems = medicines.filter(m => m.stock < 50);

        // 4. Sales by Medicine (Top 5)
        const medicineSales: Record<string, number> = {};
        transactions.forEach(t => {
            t.items.forEach(item => {
                medicineSales[item.medicineName] = (medicineSales[item.medicineName] || 0) + item.quantity;
            });
        });

        const topMedicines = Object.entries(medicineSales)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        // 5. Recent Transactions
        const recentTransactions = transactions.slice(-10).reverse();

        res.json({
            totalSales,
            transactionCount,
            lowStockCount: lowStockItems.length,
            topMedicines,
            recentTransactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
