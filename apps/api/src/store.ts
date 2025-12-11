import { User, Role, Medicine, Prescription, Appointment, AppointmentStatus, Transaction, TransactionItem } from './types';
import bcrypt from 'bcryptjs';

// In-memory store for MVP dev (Mocking Database)
// TODO: Replace with Prisma/PostgreSQL once environment issues are resolved.

import { sqlite, initDb } from './database';

/**
 * Store Class
 * 
 * Manages all database interactions using Better-SQLite3.
 * Acts as a Data Access Layer (DAL) for the application.
 */
class Store {
    /**
     * Initializes the database connection and seeds critical default data.
     * Ensures an Admin user exists on startup.
     */
    constructor() {
        initDb(); // Creates tables if they don't exist
        this.seedAdmin(); // Ensures at least one admin account
    }

    private seedAdmin() {
        const admin = this.findUserByEmail('admin@pms.com');
        if (!admin) {
            this.createUser({
                email: 'admin@pms.com',
                password: bcrypt.hashSync('admin123', 10),
                name: 'System Admin',
                role: Role.ADMIN,
                permissions: ['INVENTORY', 'PRESCRIPTIONS', 'APPOINTMENTS', 'BILLING', 'REPORTS', 'USERS']
            });
            console.log('Seeded Admin User');
        }
    }

    /**
     * Creates a new user in the database.
     * Automatically assigns default permissions based on the user's role if none are provided.
     * 
     * @param userData - The user details (name, email, password, role, etc.)
     * @returns The created User object with its generated ID.
     */
    createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
        let initialPermissions = userData.permissions || [];
        if (initialPermissions.length === 0) {
            switch (userData.role) {
                case Role.ADMIN:
                    initialPermissions = ['INVENTORY', 'PRESCRIPTIONS', 'APPOINTMENTS', 'BILLING', 'REPORTS', 'USERS'];
                    break;
                case Role.PHARMACIST:
                    initialPermissions = ['INVENTORY', 'BILLING', 'PRESCRIPTIONS'];
                    break;
                case Role.DOCTOR:
                    initialPermissions = ['PRESCRIPTIONS', 'APPOINTMENTS'];
                    break;
                case Role.SALES_REP:
                    initialPermissions = ['INVENTORY'];
                    break;
                default:
                    initialPermissions = [];
            }
        }

        const stmt = sqlite.prepare(`
            INSERT INTO users (email, password, name, role, permissions, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const now = new Date().toISOString();
        const info = stmt.run(
            userData.email,
            userData.password,
            userData.name,
            userData.role,
            JSON.stringify(initialPermissions),
            now,
            now
        );

        return {
            id: Number(info.lastInsertRowid),
            ...userData,
            permissions: initialPermissions,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };
    }

    /**
    * Updates the specific access permissions for a user.
    * This allows for granular access control beyond just Role-Based Access.
    * 
    * @param id - The ID of the user to update
    * @param permissions - Array of permission strings (e.g., ['INVENTORY', 'BILLING'])
    * @returns The updated User object, or undefined if user not found.
    */
    updateUserPermissions(id: number, permissions: string[]): User | undefined {
        const stmt = sqlite.prepare(`
            UPDATE users SET permissions = ?, updatedAt = ? WHERE id = ?
        `);
        const now = new Date().toISOString();
        const info = stmt.run(JSON.stringify(permissions), now, id);

        if (info.changes > 0) {
            const user = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
            return this.mapUser(user);
        }
        return undefined;
    }

    findUserByEmail(email: string): User | undefined {
        const user = sqlite.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
        return user ? this.mapUser(user) : undefined;
    }

    getAllUsers(): User[] {
        const users = sqlite.prepare('SELECT * FROM users').all() as any[];
        return users.map(this.mapUser);
    }

    deleteUser(id: number): boolean {
        const info = sqlite.prepare('DELETE FROM users WHERE id = ?').run(id);
        return info.changes > 0;
    }

    private mapUser(row: any): User {
        return {
            ...row,
            permissions: JSON.parse(row.permissions || '[]'),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    }

    // Medicines
    createMedicine(data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine {
        const stmt = sqlite.prepare(`
            INSERT INTO medicines (name, manufacturer, batchNumber, expiryDate, mrp, stock, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const now = new Date().toISOString();
        const info = stmt.run(
            data.name,
            data.manufacturer,
            data.batchNumber,
            data.expiryDate instanceof Date ? data.expiryDate.toISOString() : data.expiryDate,
            data.mrp,
            data.stock,
            now,
            now
        );
        return {
            id: Number(info.lastInsertRowid),
            ...data,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };
    }

    getAllMedicines(): Medicine[] {
        const rows = sqlite.prepare('SELECT * FROM medicines').all() as any[];
        return rows.map(row => ({
            ...row,
            expiryDate: new Date(row.expiryDate),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        }));
    }

    // Prescriptions
    createPrescription(data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Prescription {
        const now = new Date().toISOString();

        const tx = sqlite.transaction(() => {
            const stmt = sqlite.prepare(`
                INSERT INTO prescriptions (patientName, doctorName, status, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?)
            `);
            const info = stmt.run(data.patientName, data.doctorName, data.status, now, now);
            const prescriptionId = Number(info.lastInsertRowid);

            const itemStmt = sqlite.prepare(`
                INSERT INTO prescription_items (prescriptionId, medicineId, medicineName, dosage, duration, quantity)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const item of data.items) {
                itemStmt.run(prescriptionId, item.medicineId, item.medicineName, item.dosage, item.duration, item.quantity);
            }
            return prescriptionId;
        });

        const id = tx();
        return {
            id,
            ...data,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };
    }

    getAllPrescriptions(): Prescription[] {
        const prescriptions = sqlite.prepare('SELECT * FROM prescriptions').all() as any[];
        const items = sqlite.prepare('SELECT * FROM prescription_items').all() as any[];

        return prescriptions.map(p => ({
            ...p,
            items: items.filter(i => i.prescriptionId === p.id),
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
        }));
    }

    fulfillPrescription(id: number): Prescription | undefined {
        const stmt = sqlite.prepare('UPDATE prescriptions SET status = ?, updatedAt = ? WHERE id = ?');
        const now = new Date().toISOString();
        const info = stmt.run('FULFILLED', now, id);

        if (info.changes > 0) {
            const p = sqlite.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id) as any;
            const items = sqlite.prepare('SELECT * FROM prescription_items WHERE prescriptionId = ?').all(id) as any[];
            return {
                ...p,
                items,
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt)
            };
        }
        return undefined;
    }

    // Appointments
    createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Appointment {
        const stmt = sqlite.prepare(`
            INSERT INTO appointments (patientName, doctorName, date, time, status, notes, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const now = new Date().toISOString();
        const status = AppointmentStatus.SCHEDULED;
        const info = stmt.run(data.patientName, data.doctorName, data.date, data.time, status, data.notes || null, now, now);

        return {
            id: Number(info.lastInsertRowid),
            ...data,
            status,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };
    }

    getAllAppointments(): Appointment[] {
        const rows = sqlite.prepare('SELECT * FROM appointments').all() as any[];
        return rows.map(row => ({
            ...row,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        }));
    }

    updateAppointmentStatus(id: number, status: AppointmentStatus): Appointment | undefined {
        const stmt = sqlite.prepare('UPDATE appointments SET status = ?, updatedAt = ? WHERE id = ?');
        const now = new Date().toISOString();
        const info = stmt.run(status, now, id);

        if (info.changes > 0) {
            const row = sqlite.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any;
            return {
                ...row,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt)
            };
        }
        return undefined;
    }

    // Transactions
    /**
    * Records a new sales transaction.
    * Uses a database TRANSACTION to ensure two critical things happen atomically:
    * 1. The transaction record is created.
    * 2. The stock level for each medicine is deducted.
    * If one fails, the entire operation rolls back to prevent data inconsistency.
    * 
    * @param data - The transaction total and list of items sold.
    * @returns The created Transaction object.
    */
    createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
        const now = new Date().toISOString();

        const tx = sqlite.transaction(() => {
            const stmt = sqlite.prepare(`
                INSERT INTO transactions (totalAmount, createdAt)
                VALUES (?, ?)
            `);
            const info = stmt.run(data.totalAmount, now);
            const transactionId = Number(info.lastInsertRowid);

            const itemStmt = sqlite.prepare(`
                INSERT INTO transaction_items (transactionId, medicineId, medicineName, quantity, priceCheck, total)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const updateStockStmt = sqlite.prepare(`
                UPDATE medicines SET stock = stock - ? WHERE id = ?
            `);

            for (const item of data.items) {
                itemStmt.run(transactionId, item.medicineId, item.medicineName, item.quantity, item.priceCheck, item.total);
                updateStockStmt.run(item.quantity, item.medicineId);
            }
            return transactionId;
        });

        const id = tx();
        return {
            id,
            ...data,
            createdAt: new Date(now)
        };
    }

    getAllTransactions(): Transaction[] {
        const transactions = sqlite.prepare('SELECT * FROM transactions').all() as any[];
        const items = sqlite.prepare('SELECT * FROM transaction_items').all() as any[];

        return transactions.map(t => ({
            ...t,
            items: items.filter(i => i.transactionId === t.id),
            createdAt: new Date(t.createdAt)
        }));
    }
}

export const db = new Store();
