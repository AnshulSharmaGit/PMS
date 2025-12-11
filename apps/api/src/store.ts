import { User, Role, Medicine, Prescription, Appointment, AppointmentStatus, Transaction, TransactionItem } from './types';
import bcrypt from 'bcryptjs';

// In-memory store for MVP dev (Mocking Database)
// TODO: Replace with Prisma/PostgreSQL once environment issues are resolved.

class Store {
    users: User[] = [];
    medicines: Medicine[] = [];
    prescriptions: Prescription[] = [];
    appointments: Appointment[] = [];
    transactions: Transaction[] = [];
    private idCounter = 1;

    constructor() {
        // Seed Admin
        this.createUser({
            email: 'admin@pms.com',
            password: bcrypt.hashSync('admin123', 10),
            name: 'System Admin',
            role: Role.ADMIN,
            permissions: ['INVENTORY', 'PRESCRIPTIONS', 'APPOINTMENTS', 'BILLING', 'REPORTS', 'USERS']
        });

        // Seed some medicines
        this.createMedicine({
            name: 'Paracetamol 500mg',
            manufacturer: 'HealthCorp',
            batchNumber: 'BATCH001',
            expiryDate: new Date('2025-12-31'),
            mrp: 50.00,
            stock: 1000
        });
        this.createMedicine({
            name: 'Amoxicillin 250mg',
            manufacturer: 'PharmaInc',
            batchNumber: 'BATCH002',
            expiryDate: new Date('2024-06-30'),
            mrp: 120.50,
            stock: 500
        });
    }

    createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
        // Default permissions based on Role if not provided
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

        const user: User = {
            ...userData,
            permissions: initialPermissions,
            id: this.idCounter++,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.push(user);
        return user;
    }

    updateUserPermissions(id: number, permissions: string[]): User | undefined {
        const user = this.users.find(u => u.id === id);
        if (user) {
            user.permissions = permissions;
            user.updatedAt = new Date();
        }
        return user;
    }

    findUserByEmail(email: string): User | undefined {
        return this.users.find(u => u.email === email);
    }

    createMedicine(data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine {
        const medicine: Medicine = {
            ...data,
            id: this.idCounter++,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.medicines.push(medicine);
        return medicine;
    }

    getAllMedicines(): Medicine[] {
        return this.medicines;
    }

    createPrescription(data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Prescription {
        const prescription: Prescription = {
            ...data,
            id: this.idCounter++,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.prescriptions.push(prescription);
        return prescription;
    }

    getAllPrescriptions(): Prescription[] {
        return this.prescriptions;
    }

    fulfillPrescription(id: number): Prescription | undefined {
        const prescription = this.prescriptions.find(p => p.id === id);
        if (prescription) {
            prescription.status = 'FULFILLED';
            prescription.updatedAt = new Date();
        }
        return prescription;
    }

    createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Appointment {
        const appointment: Appointment = {
            ...data,
            id: this.idCounter++,
            status: AppointmentStatus.SCHEDULED,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.appointments.push(appointment);
        return appointment;
    }

    getAllAppointments(): Appointment[] {
        return this.appointments;
    }

    updateAppointmentStatus(id: number, status: AppointmentStatus): Appointment | undefined {
        const appointment = this.appointments.find(a => a.id === id);
        if (appointment) {
            appointment.status = status;
            appointment.updatedAt = new Date();
        }
        return appointment;
    }

    createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
        const transaction: Transaction = {
            ...data,
            id: this.idCounter++,
            createdAt: new Date()
        };
        this.transactions.push(transaction);

        // Deduct stock
        data.items.forEach(item => {
            const med = this.medicines.find(m => m.id === item.medicineId);
            if (med) {
                med.stock -= item.quantity;
            }
        });

        return transaction;
    }

    getAllTransactions(): Transaction[] {
        return this.transactions;
    }

    getAllUsers(): User[] {
        return this.users;
    }
    deleteUser(id: number): boolean {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }
}

export const db = new Store();
