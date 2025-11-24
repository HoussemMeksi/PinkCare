import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import eventRoutes from './routes/events.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.MONGODB_URI;

mongoose.connect(CONNECTION_URL)
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message));
