import { Appointment, Event } from './types';

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    title: 'Consultation Oncologie',
    doctorName: 'Dr. Martin',
    date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
    type: 'Consultation',
    notes: 'Apporter les résultats de la prise de sang.',
  },
  {
    id: '2',
    title: 'Séance de Chimiothérapie',
    doctorName: 'Hôpital Saint-Louis',
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    type: 'Chemotherapy',
  },
  {
    id: '3',
    title: 'Mammographie de contrôle',
    doctorName: 'Centre Imagerie',
    date: new Date(new Date().setDate(new Date().getDate() + 20)),
    type: 'Imaging',
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: '101',
    title: 'Marche Rose',
    date: new Date(new Date().setDate(new Date().getDate() + 10)),
    location: 'Parc Central, Lyon',
    description: 'Une marche solidaire de 5km pour sensibiliser au dépistage.',
    attendees: 120,
  },
  {
    id: '102',
    title: 'Atelier Bien-être & Nutrition',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    location: 'Salle Polyvalente',
    description: 'Conseils nutritionnels pour mieux vivre le traitement.',
    attendees: 15,
  }
];

export const DAILY_TIP = "N'oubliez pas de boire beaucoup d'eau aujourd'hui et de prendre 10 minutes pour vous relaxer.";
