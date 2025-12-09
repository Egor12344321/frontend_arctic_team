import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExpeditionList from '../components/expeditions/ExpeditionList';
import CreateExpeditionModal from '../components/expeditions/CreateExpeditionModal';

function DashboardPage() {
  const [expeditions, setExpeditions] = useState({ asLeader: [], asParticipant: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await loadUserExpeditions();
    } catch (error) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        try {
          await refreshToken();
          await loadUserExpeditions();
        } catch (refreshError) {
          handleLogout();
        }
      }
    }
  };

  const loadUserExpeditions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:8080/api/expeditions/my',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      setExpeditions(response.data);
      setLoading(false);
    } catch (error) {
      setError('Не удалось загрузить экспедиции');
      setLoading(false);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/refresh',
        {},
        { withCredentials: true }
      );
      
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('accessToken');
    
    try {
      await axios.post(
        'http://localhost:8080/api/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      navigate('/login');
    }
  };

  const handleCreateExpedition = async (expeditionData) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/expeditions',
        expeditionData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      // Обновляем список экспедиций
      await loadUserExpeditions();
      setShowCreateModal(false);
      
      return response.data;
    } catch (error) {
      console.error('Create expedition error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Загружаем ваши экспедиции...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>🏔️ Arctic Expedition Dashboard</h1>
          <p className="text-muted">
            Добро пожаловать в систему мониторинга экспедиций
          </p>
        </div>
        <div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary me-2"
            title="Создать новую экспедицию"
          >
            + Новая экспедиция
          </button>
          <button onClick={handleLogout} className="btn btn-outline-danger">
            Выйти
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button 
            onClick={loadUserExpeditions}
            className="btn btn-sm btn-danger ms-3"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Мои экспедиции как руководитель */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            👑 Мои экспедиции (как руководитель)
            <span className="badge bg-light text-primary ms-2">
              {expeditions.asLeader.length}
            </span>
          </h5>
        </div>
        <div className="card-body">
          {expeditions.asLeader.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">Вы еще не создавали экспедиции</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Создать первую экспедицию
              </button>
            </div>
          ) : (
            <ExpeditionList 
              expeditions={expeditions.asLeader}
              showRole={false}
              onRefresh={loadUserExpeditions}
            />
          )}
        </div>
      </div>

      {/* Мои экспедиции как участник */}
      <div className="card">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            🧑‍🤝‍🧑 Мои экспедиции (как участник)
            <span className="badge bg-light text-success ms-2">
              {expeditions.asParticipant.length}
            </span>
          </h5>
        </div>
        <div className="card-body">
          {expeditions.asParticipant.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">Вы еще не участвовали в экспедициях</p>
              <p className="small text-muted">
                Попросите руководителя добавить вас в экспедицию по вашему индивидуальному номеру
              </p>
            </div>
          ) : (
            <ExpeditionList 
              expeditions={expeditions.asParticipant}
              showRole={false}
              onRefresh={loadUserExpeditions}
            />
          )}
        </div>
      </div>

      {/* Модальное окно создания экспедиции */}
      <CreateExpeditionModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateExpedition}
      />
    </div>
  );
}

export default DashboardPage;