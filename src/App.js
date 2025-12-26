import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExpeditionDetailPage from './pages/ExpeditionDetailPage';
import AdminPage from './pages/AdminPage';
import MyMetricsPage from './pages/MyMetricsPage'; // Новая страница
import ParticipantMetricsPage from './pages/ParticipantMetricsPage.js'; // Новая страница

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  const rolesJson = localStorage.getItem('userRoles');
  const roles = rolesJson ? JSON.parse(rolesJson) : [];
  
  if (!roles.includes('ROLE_ADMIN')) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/expeditions/:id" element={
          <ProtectedRoute>
            <ExpeditionDetailPage />
          </ProtectedRoute>
        } />
        
        {/* Новый маршрут для просмотра своих метрик */}
        <Route path="/expeditions/:expeditionId/my-metrics" element={
          <ProtectedRoute>
            <MyMetricsPage />
          </ProtectedRoute>
        } />
        
        {/* Новый маршрут для просмотра метрик участника (для руководителей) */}
        <Route path="/expeditions/:expeditionId/participants/:participantId/metrics" element={
          <ProtectedRoute>
            <ParticipantMetricsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;