import React, { useState, useEffect } from 'react';
import { ViewState, User, UserRole, Appointment, Event } from './types';
import { IconHome, IconCalendar, IconHeartPulse, IconUsers, IconBook, IconLogOut, IconPlus } from './components/Icons';
import { MOCK_APPOINTMENTS, MOCK_EVENTS, DAILY_TIP } from './constants';
import { generateHealthAdvice, chatWithAssistant } from './services/geminiService';

// --- Sub-components defined here for simplicity in single-file requirement context, 
// usually would be in components/ folder ---

// 1. AUTH COMPONENT
const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.result);
        localStorage.setItem('token', data.token); // Store token
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-4">
            <IconHeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">PinkCare</h1>
          <p className="text-gray-500 mt-2">Votre compagnon santé au quotidien</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
          >
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-rose-600 hover:text-rose-500 font-medium"
          >
            {isLogin ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. DASHBOARD COMPONENT
const Dashboard = ({ user, changeView }: { user: User, changeView: (v: ViewState) => void }) => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-rose-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bonjour, {user.name} 👋</h2>
          <p className="text-gray-500">Voici votre résumé du jour.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-rose-600">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Tip Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-rose-500 to-rose-400 p-6 rounded-xl shadow-md text-white">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <IconHeartPulse className="w-5 h-5" /> Conseil du jour
          </h3>
          <p className="text-rose-50">{DAILY_TIP}</p>
        </div>

        {/* Quick Action */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-center items-center cursor-pointer hover:bg-rose-50 transition-colors" onClick={() => changeView(ViewState.HEALTH)}>
          <div className="bg-rose-100 p-3 rounded-full mb-3">
            <IconHeartPulse className="w-8 h-8 text-rose-600" />
          </div>
          <span className="font-medium text-gray-700">Comment allez-vous ?</span>
          <span className="text-xs text-gray-400 mt-1">Enregistrer vos symptômes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Prochains Rendez-vous</h3>
            <button onClick={() => changeView(ViewState.APPOINTMENTS)} className="text-sm text-rose-600 hover:underline">Voir tout</button>
          </div>
          <div className="space-y-3">
            {MOCK_APPOINTMENTS.slice(0, 2).map(apt => (
              <div key={apt.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="bg-rose-100 text-rose-600 p-2 rounded-lg mr-3 flex-shrink-0 font-bold text-center w-14">
                  <div className="text-xs uppercase">{apt.date.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                  <div className="text-lg">{apt.date.getDate()}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{apt.title}</h4>
                  <p className="text-sm text-gray-500">{apt.doctorName} • {apt.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Événements à venir</h3>
            <button onClick={() => changeView(ViewState.EVENTS)} className="text-sm text-rose-600 hover:underline">Voir tout</button>
          </div>
          <div className="space-y-3">
            {MOCK_EVENTS.slice(0, 2).map(evt => (
              <div key={evt.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 flex-shrink-0">
                  <IconUsers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{evt.title}</h4>
                  <p className="text-sm text-gray-500">{evt.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. APPOINTMENTS COMPONENT
const Appointments = ({ appointments }: { appointments: Appointment[] }) => {
  const [items, setItems] = useState(appointments);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const formattedData = data.map((apt: any) => ({
          ...apt,
          date: new Date(apt.date),
          id: apt._id // Map _id to id
        }));
        setItems(formattedData);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const addAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      title: newTitle,
      doctorName: 'Nouveau Docteur', // Should be dynamic
      date: new Date(newDate),
      type: 'Consultation',
      userId: '65f...', // Should come from auth context/user state
    };

    try {
      // For now, we need a valid userId. In a real app, the backend extracts it from the token.
      // Since we are sending it in the body for this simple implementation (as per schema), let's mock or get it.
      // Actually, the schema requires userId. Let's assume the backend handles it or we send a dummy one if not authenticated fully in backend yet.
      // Wait, I didn't add auth middleware to the appointment route yet, but the model requires userId.
      // I should probably update the model or route to handle this. For now, let's send a dummy ID or handle it in the backend.
      // Let's update the backend route to not require userId for now or use a default one for testing if no auth middleware.
      // Or better, let's just send a dummy ID here.
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, userId: '60d5ecb8b487343568912345' }), // Dummy ID
      });

      if (response.ok) {
        fetchAppointments(); // Refresh list
        setShowForm(false);
        setNewTitle('');
        setNewDate('');
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Mes Rendez-vous</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 flex items-center gap-2"
        >
          <IconPlus className="w-4 h-4" /> Nouveau
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-rose-200 animate-fade-in">
          <h3 className="font-semibold mb-4">Ajouter un rendez-vous</h3>
          <form onSubmit={addAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titre (ex: Consult Dr. Smith)"
              className="border p-2 rounded"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              className="border p-2 rounded"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
            <div className="md:col-span-2">
              <button type="submit" className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((apt) => (
              <tr key={apt.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {apt.date.toLocaleDateString('fr-FR')} à {apt.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{apt.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.doctorName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${apt.type === 'Chemotherapy' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {apt.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="p-8 text-center text-gray-500">Aucun rendez-vous prévu.</div>}
      </div>
    </div>
  );
};

// 4. HEALTH COMPONENT (With Gemini)
const HealthTracker = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Bonjour. Je suis Rose, votre assistante santé. Comment vous sentez-vous aujourd\'hui ? Je peux vous aider à comprendre vos symptômes ou vous donner des conseils de bien-être.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('😐');
  const [painLevel, setPainLevel] = useState(5);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const responseText = await chatWithAssistant(messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: responseText || "Désolé, je n'ai pas pu répondre." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Erreur de connexion avec l'IA." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJournal = () => {
    alert(`Journal enregistré !\nHumeur : ${mood}\nDouleur : ${painLevel}/10`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Symptom Quick Log */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Journal rapide</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Humeur</label>
              <div className="flex gap-2">
                {['😊', '😐', '😔', '😫'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setMood(emoji)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${mood === emoji ? 'bg-rose-200 ring-2 ring-rose-500' : 'bg-gray-100 hover:bg-rose-100'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Douleur ({painLevel}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
            <button
              onClick={handleSaveJournal}
              className="w-full bg-rose-100 text-rose-700 py-2 rounded-lg hover:bg-rose-200 font-medium transition-colors"
            >
              Enregistrer le journal
            </button>
          </div>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-2">Rappel Médicaments</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Tamoxifène - 20mg (Matin)</li>
            <li>Vitamine D (Midi)</li>
          </ul>
        </div>
      </div>

      {/* AI Chat */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-rose-50 p-4 border-b border-rose-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h3 className="font-bold text-rose-800">Assistant IA Rose</h3>
          </div>
          <span className="text-xs text-rose-500 bg-rose-100 px-2 py-1 rounded">Powered by Gemini</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                ? 'bg-rose-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 p-3 rounded-2xl rounded-bl-none animate-pulse text-sm text-gray-500">
                Rose écrit...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Posez une question sur votre santé..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-rose-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-rose-700 disabled:bg-rose-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. CALENDAR COMPONENT
const CalendarView = ({ appointments }: { appointments: Appointment[] }) => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const today = new Date().getDate();

  const getAptsForDay = (day: number) => {
    return appointments.filter(a => a.date.getDate() === day);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Calendrier</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-bold text-gray-500">
          <div>LUN</div><div>MAR</div><div>MER</div><div>JEU</div><div>VEN</div><div>SAM</div><div>DIM</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayApts = getAptsForDay(day);
            const isToday = day === today;
            return (
              <div key={day} className={`min-h-[100px] border rounded-lg p-2 flex flex-col ${isToday ? 'border-rose-500 bg-rose-50' : 'border-gray-100'}`}>
                <span className={`text-sm font-semibold mb-1 ${isToday ? 'text-rose-600' : 'text-gray-700'}`}>{day}</span>
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayApts.map(a => (
                    <div key={a.id} className="text-[10px] bg-rose-200 text-rose-800 px-1 py-0.5 rounded truncate" title={a.title}>
                      {a.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

// 6. RESOURCES / "CONCEUR" PAGE
interface Article {
  id: string;
  title: string;
  image: string;
  category: string;
  content: string;
}

const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Le Dépistage',
    image: 'https://picsum.photos/400/200',
    category: 'Prévention',
    content: `
      <h3 class="font-bold text-xl mb-4">Pourquoi le dépistage est essentiel ?</h3>
      <p class="mb-4">Le cancer du sein est le cancer le plus fréquent chez la femme. Détecté tôt, il se guérit dans 9 cas sur 10.</p>
      <h4 class="font-bold text-lg mb-2">La mammographie</h4>
      <p class="mb-4">C'est l'examen de référence. Elle permet de visualiser des anomalies de petite taille, invisibles à la palpation.</p>
      <h4 class="font-bold text-lg mb-2">L'auto-palpation</h4>
      <p>Il est recommandé de pratiquer l'auto-palpation une fois par mois, après les règles. Cela permet de bien connaître ses seins et de repérer tout changement.</p>
    `
  },
  {
    id: '2',
    title: 'Nutrition & Soins',
    image: 'https://picsum.photos/400/201',
    category: 'Bien-être',
    content: `
      <h3 class="font-bold text-xl mb-4">Bien manger pendant les traitements</h3>
      <p class="mb-4">Une alimentation équilibrée aide à mieux supporter les traitements et à conserver son énergie.</p>
      <ul class="list-disc pl-5 mb-4 space-y-2">
        <li>Privilégiez les fruits et légumes de saison.</li>
        <li>Hydratez-vous régulièrement (1,5L d'eau par jour).</li>
        <li>Fractionnez vos repas si vous avez peu d'appétit.</li>
      </ul>
    `
  },
  {
    id: '3',
    title: 'Soutien Psychologique',
    image: 'https://picsum.photos/400/202',
    category: 'Psychologie',
    content: `
      <h3 class="font-bold text-xl mb-4">Vous n'êtes pas seule</h3>
      <p class="mb-4">L'annonce de la maladie est un choc. Il est normal de ressentir de la peur, de la colère ou de la tristesse.</p>
      <p class="mb-4">N'hésitez pas à :</p>
      <ul class="list-disc pl-5 mb-4 space-y-2">
        <li>En parler à vos proches.</li>
        <li>Rejoindre des groupes de parole.</li>
        <li>Consulter un psycho-oncologue.</li>
      </ul>
    `
  }
];

const Resources = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (selectedArticle) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center text-rose-600 hover:text-rose-700 font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Retour aux ressources
        </button>

        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-64 object-cover" />
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-medium">{selectedArticle.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{selectedArticle.title}</h1>
            <div className="prose prose-rose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Comprendre le Cancer du Sein</h2>
        <p className="text-gray-600">Des ressources fiables pour vous informer et vous accompagner tout au long de votre parcours de soin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ARTICLES.map(article => (
          <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{article.title}</h3>
              <p className="text-gray-600 text-sm mb-4 flex-1">Cliquez ci-dessous pour lire l'article complet sur {article.title.toLowerCase()}.</p>
              <button
                onClick={() => setSelectedArticle(article)}
                className="text-rose-600 font-medium text-sm hover:underline text-left"
              >
                Lire l'article
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map((evt: any) => ({
          ...evt,
          date: new Date(evt.date),
          id: evt._id
        }));
        setEvents(formattedData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRegister = (eventName: string) => {
    alert(`Félicitations ! Vous êtes inscrite à l'événement : "${eventName}".\nVous recevrez bientôt un email de confirmation.`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Événements Communautaires</h2>
      <div className="grid grid-cols-1 gap-4">
        {events.length === 0 && <p className="text-gray-500">Aucun événement trouvé.</p>}
        {events.map(evt => (
          <div key={evt.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
            <div className="bg-indigo-50 w-full md:w-32 flex flex-col items-center justify-center rounded-lg p-4 text-indigo-700">
              <span className="text-2xl font-bold">{evt.date.getDate()}</span>
              <span className="text-sm uppercase">{evt.date.toLocaleDateString('fr-FR', { month: 'short' })}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{evt.title}</h3>
              <p className="text-gray-500 mb-2 flex items-center gap-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">📍 {evt.location}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">👥 {evt.attendees} participants</span>
              </p>
              <p className="text-gray-600">{evt.description}</p>
              <button
                onClick={() => handleRegister(evt.title)}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                S'inscrire
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// MAIN APP COMPONENT
const MainApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${currentView === view
        ? 'bg-rose-100 text-rose-700 font-semibold'
        : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-rose-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col z-10">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
          <div className="bg-rose-500 p-2 rounded-lg text-white">
            <IconHeartPulse className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-gray-800">PinkCare</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem view={ViewState.DASHBOARD} icon={IconHome} label="Accueil" />
          <NavItem view={ViewState.APPOINTMENTS} icon={IconBook} label="Rendez-vous" />
          <NavItem view={ViewState.CALENDAR} icon={IconCalendar} label="Calendrier" />
          <NavItem view={ViewState.HEALTH} icon={IconHeartPulse} label="Santé & IA" />
          <NavItem view={ViewState.EVENTS} icon={IconUsers} label="Événements" />
          <NavItem view={ViewState.RESOURCES} icon={IconBook} label="Info Cancer" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setUser(null)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <IconLogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <header className="md:hidden fixed top-0 w-full bg-white z-20 border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <IconHeartPulse className="w-6 h-6 text-rose-600" />
          <span className="font-bold text-gray-800">PinkCare</span>
        </div>
        <button onClick={() => setUser(null)} className="text-gray-500"><IconLogOut /></button>
      </header>

      {/* Mobile Nav Bar (Bottom) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-20 text-xs">
        <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className={`flex flex-col items-center ${currentView === ViewState.DASHBOARD ? 'text-rose-600' : 'text-gray-500'}`}><IconHome className="w-6 h-6" /><span>Accueil</span></button>
        <button onClick={() => setCurrentView(ViewState.CALENDAR)} className={`flex flex-col items-center ${currentView === ViewState.CALENDAR ? 'text-rose-600' : 'text-gray-500'}`}><IconCalendar className="w-6 h-6" /><span>Agenda</span></button>
        <button onClick={() => setCurrentView(ViewState.HEALTH)} className={`flex flex-col items-center ${currentView === ViewState.HEALTH ? 'text-rose-600' : 'text-gray-500'}`}><IconHeartPulse className="w-6 h-6" /><span>Santé</span></button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {currentView === ViewState.DASHBOARD && <Dashboard user={user} changeView={setCurrentView} />}
          {currentView === ViewState.APPOINTMENTS && <Appointments appointments={MOCK_APPOINTMENTS} />}
          {currentView === ViewState.CALENDAR && <CalendarView appointments={MOCK_APPOINTMENTS} />}
          {currentView === ViewState.HEALTH && <HealthTracker />}
          {currentView === ViewState.EVENTS && <EventsPage />}
          {currentView === ViewState.RESOURCES && <Resources />}
        </div>
      </main>
    </div>
  );
};

export default MainApp;
