import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Get all appointments for a user
router.get('/', async (req, res) => {
    try {
        // In a real app, we would get the userId from the auth middleware
        // For now, we might pass it as a query param or header for simplicity if not implementing full auth middleware yet
        // But let's assume we want to fetch all for demo or filter by user if provided
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Create a new appointment
router.post('/', async (req, res) => {
    const appointment = req.body;
    const newAppointment = new Appointment(appointment);
    try {
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
});

export default router;
