export enum Role {
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
    PHARMACIST = 'PHARMACIST',
    SALES_REP = 'SALES_REP',
    CUSTOMER = 'CUSTOMER'
}

export interface User {
    id: number;
    email: string;
    password: string; // Hashed
    name: string;
    role: Role;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Medicine {
    id: number;
    name: string;
    manufacturer: string;
    batchNumber: string;
    expiryDate: Date;
    mrp: number;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrescriptionItem {
    medicineId: number;
    medicineName: string;
    dosage: string;
    duration: string;
    quantity: number;
}

export interface Prescription {
    id: number;
    patientName: string;
    doctorName: string;
    items: PrescriptionItem[];
    status: 'PENDING' | 'FULFILLED';
    createdAt: Date;
    updatedAt: Date;
}

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    CHECKED_IN = 'CHECKED_IN',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface Appointment {
    id: number;
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    status: AppointmentStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionItem {
    medicineId: number;
    medicineName: string;
    quantity: number;
    priceCheck: number;
    total: number;
}

export interface Transaction {
    id: number;
    totalAmount: number;
    items: TransactionItem[];
    createdAt: Date;
}
