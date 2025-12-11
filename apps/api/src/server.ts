import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import medicineRoutes from './routes/medicine.routes';
import prescriptionRoutes from './routes/prescription.routes';
import appointmentRoutes from './routes/appointment.routes';
import billingRoutes from './routes/billing.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Pharmacy Management System API' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
