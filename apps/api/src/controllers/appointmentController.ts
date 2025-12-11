import { Request, Response } from 'express';
import { db } from '../store';
import { AppointmentStatus } from '../types';

export const createAppointment = (req: Request, res: Response): void => {
    try {
        const { patientName, doctorName, date, time } = req.body;

        if (!patientName || !doctorName || !date || !time) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // In a real app, we would check for double-booking here

        const appointment = db.createAppointment({
            patientName,
            doctorName,
            date,
            time,
            notes: req.body.notes
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const getAppointments = (req: Request, res: Response): void => {
    try {
        const appointments = db.getAllAppointments();
        // Sort by date/time ideally
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const updateAppointmentStatus = (req: Request, res: Response): void => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(AppointmentStatus).includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        const appointment = db.updateAppointmentStatus(Number(id), status);

        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
