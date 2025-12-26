import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExpeditionList from '../components/expeditions/ExpeditionList';
import CreateExpeditionModal from '../components/expeditions/CreateExpeditionModal';
import ManageParticipantsModal from '../components/expeditions/ManageParticipantsModal';
import EditExpeditionModal from '../components/expeditions/EditExpeditionModal';

function DashboardPage() {
  const [expeditions, setExpeditions] = useState({ asLeader: [], asParticipant: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpedition, setSelectedExpedition] = useState(null);
  const navigate = useNavigate();

  const isAdmin = () => {
    try {
      const rolesJson = localStorage.getItem('userRoles');
      const roles = rolesJson ? JSON.parse(rolesJson) : [];
      return roles.includes('ROLE_ADMIN');
    } catch (e) {
      return false;
    }
  };

  const isLeader = () => {
    try {
      const rolesJson = localStorage.getItem('userRoles');
      const roles = rolesJson ? JSON.parse(rolesJson) : [];
      return roles.includes('ROLE_LEADER');
    } catch (e) {
      return false;
    }
  };

  const canCreateExpedition = () => {
    return isAdmin() || isLeader();
  };

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
      localStorage.removeItem('userRoles');
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
      
      await loadUserExpeditions();
      setShowCreateModal(false);
      
      return response.data;
    } catch (error) {
      console.error('Create expedition error:', error);
      throw error;
    }
  };

  const handleManageParticipants = (expedition) => {
    console.log('Opening participants modal for expedition:', expedition);
    setSelectedExpedition(expedition);
    setShowParticipantsModal(true);
  };

  const handleEditExpedition = (expedition) => {
    console.log('Opening edit modal for expedition:', expedition);
    setSelectedExpedition(expedition);
    setShowEditModal(true);
  };

  const handleUpdateExpedition = async (updatedData) => {
    try {
      await axios.put(
        `http://localhost:8080/api/expeditions/${selectedExpedition.id}`,
        updatedData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      await loadUserExpeditions();
      setShowEditModal(false);
      setSelectedExpedition(null);
    } catch (error) {
      console.error('Update expedition error:', error);
      throw error;
    }
  };

  const handleDeleteExpedition = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить экспедицию? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/expeditions/${selectedExpedition.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      await loadUserExpeditions();
      setShowEditModal(false);
      setSelectedExpedition(null);
    } catch (error) {
      console.error('Delete expedition error:', error);
      alert('Не удалось удалить экспедицию');
    }
  };

  const handleAddParticipant = async (userId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/expeditions/${selectedExpedition.id}/participants`,
        { userId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Add participant error:', error);
      throw error;
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/expeditions/${selectedExpedition.id}/participants/${participantId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Remove participant error:', error);
      throw error;
    }
  };

  const handleSearchUser = async (individualNumber) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/search?individualNumber=${individualNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleGetParticipants = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/expeditions/${selectedExpedition.id}/participants`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>🏔️ Arctic Expedition Dashboard</h1>
          <p className="text-muted">
            Добро пожаловать в систему мониторинга экспедиций
          </p>
        </div>
        <div>
          {canCreateExpedition() && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary me-2"
              title="Создать новую экспедицию"
            >
              + Новая экспедиция
            </button>
          )}
          
          {isAdmin() && (
            <button 
              onClick={() => navigate('/admin')}
              className="btn btn-warning me-2"
              title="Перейти в админ-панель"
            >
              👑 Админ-панель
            </button>
          )}
          
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
              {canCreateExpedition() && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  Создать первую экспедицию
                </button>
              )}
            </div>
          ) : (
            <ExpeditionList 
              expeditions={expeditions.asLeader}
              showRole={false}
              onRefresh={loadUserExpeditions}
              onManageParticipants={handleManageParticipants}
              onEditExpedition={handleEditExpedition}
            />
          )}
        </div>
      </div>

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
              onManageParticipants={handleManageParticipants}
              onEditExpedition={handleEditExpedition}
            />
          )}
        </div>
      </div>

      {canCreateExpedition() && (
        <CreateExpeditionModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateExpedition}
        />
      )}

      {showParticipantsModal && selectedExpedition && (
        <ManageParticipantsModal
          show={showParticipantsModal}
          onClose={() => {
            setShowParticipantsModal(false);
            setSelectedExpedition(null);
          }}
          expeditionId={selectedExpedition.id}
          expeditionName={selectedExpedition.name}
          onAddParticipant={handleAddParticipant}
          onRemoveParticipant={handleRemoveParticipant}
          onSearchUser={handleSearchUser}
          onGetParticipants={handleGetParticipants}
        />
      )}

      {showEditModal && selectedExpedition && (
        <EditExpeditionModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExpedition(null);
          }}
          expedition={selectedExpedition}
          onUpdate={handleUpdateExpedition}
          onDelete={handleDeleteExpedition}
        />
      )}
    </div>
  );
}

export default DashboardPage;