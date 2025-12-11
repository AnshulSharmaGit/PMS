import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../pms.sqlite');
export const sqlite = new Database(dbPath, { verbose: console.log });

export const initDb = () => {
    // Users
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            permissions TEXT DEFAULT '[]',
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
        )
    `);

    // Medicines
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            manufacturer TEXT NOT NULL,
            batchNumber TEXT NOT NULL,
            expiryDate TEXT NOT NULL,
            mrp REAL NOT NULL,
            stock INTEGER NOT NULL,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
        )
    `);

    // Prescriptions
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientName TEXT NOT NULL,
            doctorName TEXT NOT NULL,
            status TEXT CHECK(status IN ('PENDING', 'FULFILLED')) DEFAULT 'PENDING',
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
        )
    `);

    // Prescription Items
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS prescription_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prescriptionId INTEGER NOT NULL,
            medicineId INTEGER NOT NULL,
            medicineName TEXT NOT NULL,
            dosage TEXT NOT NULL,
            duration TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id) ON DELETE CASCADE
        )
    `);

    // Appointments
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientName TEXT NOT NULL,
            doctorName TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
        )
    `);

    // Transactions
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            totalAmount REAL NOT NULL,
            createdAt TEXT DEFAULT (datetime('now'))
        )
    `);

    // Transaction Items
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS transaction_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transactionId INTEGER NOT NULL,
            medicineId INTEGER NOT NULL,
            medicineName TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            priceCheck REAL NOT NULL,
            total REAL NOT NULL,
            FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE
        )
    `);

    console.log('Database initialized');
};
