export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Appointment {
  id: string;
  title: string;
  doctorName: string;
  date: Date;
  type: 'Consultation' | 'Chemotherapy' | 'Checkup' | 'Imaging';
  notes?: string;
}

export interface HealthLog {
  id: string;
  date: Date;
  mood: 'Happy' | 'Neutral' | 'Sad' | 'Pain';
  symptoms: string[];
  notes: string;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  description: string;
  attendees: number;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  APPOINTMENTS = 'APPOINTMENTS',
  CALENDAR = 'CALENDAR',
  HEALTH = 'HEALTH',
  EVENTS = 'EVENTS',
  RESOURCES = 'RESOURCES', // "Conceur" / Info
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
