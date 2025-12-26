import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Добавь этот импорт!
import axios from 'axios';

function ExpeditionList({ expeditions, showRole = true, onRefresh, onManageParticipants, onEditExpedition }) {
  const navigate = useNavigate();  // Теперь это определено
  const [actionLoading, setActionLoading] = useState(null);

  const isLeader = (expedition) => {
    return expedition.role === 'LEADER';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const handleManageParticipants = (expedition) => {
    if (onManageParticipants) {
      onManageParticipants(expedition);
    }
  };

  const handleEditExpedition = (expedition) => {
    if (onEditExpedition) {
      onEditExpedition(expedition);
    }
  };

  const handleLeaveExpedition = async (expeditionId) => {
    if (!window.confirm('Вы уверены, что хотите покинуть экспедицию?')) {
      return;
    }

    setActionLoading(expeditionId);
    try {
      await axios.delete(
        `http://localhost:8080/api/expeditions/${expeditionId}/leave`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error leaving expedition:', error);
      alert('Ошибка при выходе из экспедиции');
    } finally {
      setActionLoading(null);
    }
  };

  if (expeditions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">Нет экспедиций для отображения</p>
      </div>
    );
  }

  return (
    <div className="list-group">
      {expeditions.map(expedition => (
        <div key={expedition.id} className="list-group-item">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <h5 className="mb-1">{expedition.name}</h5>
              
              <p className="mb-1 text-muted">
                {expedition.description || 'Нет описания'}
              </p>
              
              <div className="d-flex gap-3 text-muted small mb-2">
                <div>
                  <strong>Даты:</strong> {formatDate(expedition.startDate)} - {formatDate(expedition.endDate)}
                </div>
                <div>
                  <strong>Руководитель:</strong> {expedition.leaderFirstName} {expedition.leaderLastName}
                </div>
                {showRole && expedition.role && (
                  <div>
                    <span className={`badge ${expedition.role === 'LEADER' ? 'bg-primary' : 'bg-success'}`}>
                      {expedition.role === 'LEADER' ? 'Руководитель' : 'Участник'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-muted small">
                Создана: {new Date(expedition.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
            
            <div className="d-flex flex-column gap-2 ms-3">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate(`/expeditions/${expedition.id}`)}
                title="Просмотреть детали"
              >
                📊 Детали
              </button>
              
              {isLeader(expedition) ? (
                <>
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleManageParticipants(expedition)}
                    title="Управление участниками"
                  >
                    👥 Участники
                  </button>
                  
                  <button 
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => handleEditExpedition(expedition)}
                    title="Редактировать экспедицию"
                  >
                    ✏️ Редактировать
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleLeaveExpedition(expedition.id)}
                  disabled={actionLoading === expedition.id}
                  title="Покинуть экспедицию"
                >
                  {actionLoading === expedition.id ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    '🚪 Покинуть'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExpeditionList;