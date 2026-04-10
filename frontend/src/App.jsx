import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/common/Toast';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import EmailConfirmation from './pages/EmailConfirmation';
import NotFound from './pages/NotFound';
import Maintenance from './pages/Maintenance';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import Tuteurs from './pages/Tuteurs';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import FindModule from './pages/student/FindModule';
import MyRequests from './pages/student/MyRequests';
import History from './pages/student/History';
import Statistics from './pages/student/Statistics';
import Profile from './pages/student/Profile';
import MyTutorials from './pages/student/MyTutorials';
import StudentDiscipline from './pages/student/StudentDiscipline';

// Tutor Pages
import TutorDashboard from './pages/tutor/Dashboard';
import ReceivedRequests from './pages/tutor/ReceivedRequests';
import Planning from './pages/tutor/Planning';
import TutorOffers from './pages/tutor/TutorOffers';
import TutorStats from './pages/tutor/TutorStats';
import TutorProfile from './pages/tutor/TutorProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminModules from './pages/admin/AdminModules';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminSettings from './pages/admin/AdminSettings';
import AdminStats from './pages/admin/AdminStats';
import AdminSignalements from './pages/admin/AdminSignalements';

// Shared Pages
import TutorDetail from './pages/shared/TutorDetail';
import BookingRequest from './pages/shared/BookingRequest';
import Session from './pages/shared/Session';
import Evaluation from './pages/shared/Evaluation';
import Chat from './pages/shared/Chat';
import Notifications from './pages/shared/Notifications';
import ReportAbsence from './pages/shared/ReportAbsence';
import AccountSettings from './pages/shared/AccountSettings';

function ProtectedRoute({ children, role }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/email-confirmation" element={<EmailConfirmation />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/modules" element={<Modules />} />
      <Route path="/modules/:id" element={<ModuleDetail />} />
      <Route path="/tuteurs" element={<Tuteurs />} />
      <Route path="/tuteurs/:id" element={<TutorDetail />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/tutorats" element={<ProtectedRoute role="student"><MyTutorials /></ProtectedRoute>} />
      <Route path="/student/modules" element={<ProtectedRoute role="student"><FindModule /></ProtectedRoute>} />
      <Route path="/student/demandes" element={<ProtectedRoute role="student"><MyRequests /></ProtectedRoute>} />
      <Route path="/student/historique" element={<ProtectedRoute role="student"><History /></ProtectedRoute>} />
      <Route path="/student/stats" element={<ProtectedRoute role="student"><Statistics /></ProtectedRoute>} />
      <Route path="/student/profil" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>} />
      <Route path="/student/chat" element={<ProtectedRoute role="student"><Chat /></ProtectedRoute>} />
      <Route path="/student/settings" element={<ProtectedRoute role="student"><AccountSettings /></ProtectedRoute>} />
      <Route path="/student/discipline" element={<ProtectedRoute role="student"><StudentDiscipline /></ProtectedRoute>} />

      {/* Tutor Routes */}
      <Route path="/tutor/dashboard" element={<ProtectedRoute role="tutor"><TutorDashboard /></ProtectedRoute>} />
      <Route path="/tutor/modules" element={<ProtectedRoute role="tutor"><Navigate to="/tutor/offres" replace /></ProtectedRoute>} />
      <Route path="/tutor/modules/new" element={<ProtectedRoute role="tutor"><Navigate to="/tutor/offres" replace /></ProtectedRoute>} />
      <Route path="/tutor/offres" element={<ProtectedRoute role="tutor"><TutorOffers /></ProtectedRoute>} />
      <Route path="/tutor/demandes" element={<ProtectedRoute role="tutor"><ReceivedRequests /></ProtectedRoute>} />
      <Route path="/tutor/planning" element={<ProtectedRoute role="tutor"><Planning /></ProtectedRoute>} />
      <Route path="/tutor/stats" element={<ProtectedRoute role="tutor"><TutorStats /></ProtectedRoute>} />
      <Route path="/tutor/profil" element={<ProtectedRoute role="tutor"><TutorProfile /></ProtectedRoute>} />
      <Route path="/tutor/notifications" element={<ProtectedRoute role="tutor"><Notifications /></ProtectedRoute>} />
      <Route path="/tutor/chat" element={<ProtectedRoute role="tutor"><Chat /></ProtectedRoute>} />
      <Route path="/tutor/settings" element={<ProtectedRoute role="tutor"><AccountSettings /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/modules" element={<ProtectedRoute role="admin"><AdminModules /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute role="admin"><AdminTransactions /></ProtectedRoute>} />
      <Route path="/admin/litiges" element={<ProtectedRoute role="admin"><AdminDisputes /></ProtectedRoute>} />
      <Route path="/admin/signalements" element={<ProtectedRoute role="admin"><AdminSignalements /></ProtectedRoute>} />
      <Route path="/admin/stats" element={<ProtectedRoute role="admin"><AdminStats /></ProtectedRoute>} />
      <Route path="/admin/parametres" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><Notifications /></ProtectedRoute>} />

      {/* Shared protected routes */}
      <Route path="/booking/new" element={currentUser ? <BookingRequest /> : <Navigate to="/login" />} />
      <Route path="/session/:id" element={currentUser ? <Session /> : <Navigate to="/login" />} />
      <Route path="/evaluation/:id" element={currentUser ? <Evaluation /> : <Navigate to="/login" />} />
      <Route path="/report-absence" element={currentUser ? <ReportAbsence /> : <Navigate to="/login" />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </AppProvider>
  );
}
