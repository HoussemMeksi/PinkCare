import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

const CONNECTION_URL = process.env.MONGODB_URI;

const MOCK_EVENTS = [
    {
        title: 'Groupe de Parole - Octobre Rose',
        date: new Date('2025-10-15T14:00:00'),
        location: 'Centre Communautaire, Paris',
        description: 'Un espace bienveillant pour échanger et partager vos expériences.',
        attendees: 12
    },
    {
        title: 'Atelier Yoga Doux',
        date: new Date('2025-10-20T10:00:00'),
        location: 'Studio Zen, Lyon',
        description: 'Séance adaptée pour retrouver mobilité et sérénité.',
        attendees: 8
    },
    {
        title: 'Conférence : Nutrition et Santé',
        date: new Date('2025-11-05T18:00:00'),
        location: 'En ligne (Zoom)',
        description: 'Conseils pratiques par une nutritionniste spécialisée.',
        attendees: 45
    }
];

mongoose.connect(CONNECTION_URL)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            await Event.deleteMany({}); // Clear existing events
            await Event.insertMany(MOCK_EVENTS);
            console.log('Events seeded successfully!');
        } catch (error) {
            console.error('Error seeding events:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch((error) => console.log(error.message));
