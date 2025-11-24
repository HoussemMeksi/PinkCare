import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    doctorName: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Appointment', appointmentSchema);
