import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ExpeditionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [expedition, setExpedition] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info' или 'participants'

  useEffect(() => {
    loadExpeditionData();
  }, [id]);

  const loadExpeditionData = async () => {
    try {
      // 1. Загружаем информацию об экспедиции
      const expeditionResponse = await axios.get(
        `http://localhost:8080/api/expeditions/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      setExpedition(expeditionResponse.data);

      // 2. Если пользователь руководитель - загружаем участников
      if (expeditionResponse.data.role === 'LEADER') {
        await loadParticipants();
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load expedition:', error);
      setError('Не удалось загрузить информацию об экспедиции');
      setLoading(false);
      
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/expeditions/${id}/participants`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      setParticipants(response.data);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };

  const handleViewMyMetrics = () => {
    navigate(`/expeditions/${id}/my-metrics`);
  };

  const handleViewParticipantMetrics = (participantId) => {
    navigate(`/expeditions/${id}/participants/${participantId}/metrics`);
  };

  const handleAddParticipant = async () => {
    const individualNumber = prompt('Введите индивидуальный номер участника (например: ARCTIC-A1B2C3D4):');
    
    if (!individualNumber) return;
    
    try {
      await axios.post(
        `http://localhost:8080/api/expeditions/${id}/participants`,
        { individualNumber },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      alert('Участник успешно добавлен!');
      await loadParticipants(); // Обновляем список
    } catch (error) {
      console.error('Failed to add participant:', error);
      alert('Ошибка при добавлении участника: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!window.confirm('Вы уверены, что хотите удалить участника из экспедиции?')) {
      return;
    }
    
    try {
      await axios.delete(
        `http://localhost:8080/api/expeditions/${id}/participants/${participantId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      alert('Участник удален из экспедиции!');
      await loadParticipants(); // Обновляем список
    } catch (error) {
      console.error('Failed to remove participant:', error);
      alert('Ошибка при удалении участника');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const renderActionButtons = () => {
    if (!expedition) return null;
    
    if (expedition.role === 'USER') {
      // Для обычного участника - только свои метрики
      return (
        <button 
          className="btn btn-primary" 
          onClick={handleViewMyMetrics}
          style={{ minWidth: '200px' }}
        >
          📊 Просмотреть мои метрики
        </button>
      );
    } else if (expedition.role === 'LEADER') {
      // Для руководителя - две возможности
      return (
        <div className="d-grid gap-2" style={{ maxWidth: '300px' }}>
          <button className="btn btn-primary" onClick={handleViewMyMetrics}>
            📊 Мои метрики (как участник)
          </button>
          <button 
            className="btn btn-success" 
            onClick={() => setActiveTab('participants')}
          >
            👥 Управление участниками
          </button>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Загружаем информацию об экспедиции...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Ошибка</h4>
          <p>{error}</p>
          <button onClick={handleBack} className="btn btn-primary">
            Вернуться к списку экспедиций
          </button>
        </div>
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>Экспедиция не найдена</h4>
          <button onClick={handleBack} className="btn btn-primary">
            Вернуться к списку экспедиций
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <button onClick={handleBack} className="btn btn-outline-secondary mb-3">
          ← Назад к списку экспедиций
        </button>
        
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h2 className="mb-0">🏔️ {expedition.name}</h2>
          </div>
          
          {/* Табы для навигации */}
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  📋 Информация
                </button>
              </li>
              {expedition.role === 'LEADER' && (
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'participants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('participants')}
                  >
                    👥 Участники ({participants.length})
                  </button>
                </li>
              )}
            </ul>
          </div>
          
          <div className="card-body">
            {activeTab === 'info' && (
              // Вкладка с информацией об экспедиции
              <div className="row">
                <div className="col-md-6">
                  <h5>Информация об экспедиции</h5>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <strong>ID:</strong> {expedition.id}
                    </li>
                    <li className="list-group-item">
                      <strong>Руководитель:</strong> {expedition.leaderFirstName} {expedition.leaderLastName}
                    </li>
                    <li className="list-group-item">
                      <strong>Email руководителя:</strong> {expedition.leaderEmail}
                    </li>
                    <li className="list-group-item">
                      <strong>Ваша роль:</strong> 
                      <span className={`badge ms-2 ${
                        expedition.role === 'LEADER' ? 'bg-warning' : 'bg-success'
                      }`}>
                        {expedition.role === 'LEADER' ? 'Руководитель' : 'Участник'}
                      </span>
                    </li>
                    <li className="list-group-item">
                      <strong>Дата начала:</strong> {new Date(expedition.startDate).toLocaleDateString('ru-RU')}
                    </li>
                    <li className="list-group-item">
                      <strong>Дата окончания:</strong> {new Date(expedition.endDate).toLocaleDateString('ru-RU')}
                    </li>
                    <li className="list-group-item">
                      <strong>Создана:</strong> {new Date(expedition.createdAt).toLocaleString('ru-RU')}
                    </li>
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <h5>Действия</h5>
                  <div className="mb-4">
                    {renderActionButtons()}
                  </div>
                  
                  <h5>Статистика</h5>
                  <div className="row text-center">
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h3>👥</h3>
                          <h4>{participants.length}</h4>
                          <p className="text-muted">Участников</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h3>📊</h3>
                          <h4>0</h4>
                          <p className="text-muted">Метрик</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'participants' && expedition.role === 'LEADER' && (
              // Вкладка с участниками (только для руководителя)
              <div className="participants-section">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Участники экспедиции</h5>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleAddParticipant}
                  >
                    + Добавить участника
                  </button>
                </div>
                
                {participants.length === 0 ? (
                  <div className="text-center p-5 border rounded">
                    <div className="mb-3">
                      <i className="bi bi-people fs-1 text-muted"></i>
                    </div>
                    <p className="text-muted">В экспедиции пока нет участников</p>
                    <p className="small text-muted mb-3">
                      Добавьте участников по их индивидуальному номеру
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={handleAddParticipant}
                    >
                      + Добавить первого участника
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Имя</th>
                          <th>Email</th>
                          <th>Индивидуальный номер</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map(participant => (
                          <tr key={participant.id}>
                            <td>
                              <strong>{participant.firstName} {participant.lastName}</strong>
                            </td>
                            <td>{participant.email}</td>
                            <td>
                              <code className="bg-light p-1 rounded">{participant.individualNumber}</code>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => handleViewParticipantMetrics(participant.id)}
                                  title="Просмотреть метрики"
                                >
                                  📊 Метрики
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => handleRemoveParticipant(participant.id)}
                                  title="Удалить из экспедиции"
                                >
                                  Удалить
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="alert alert-info mt-4">
                  <h6>💡 Информация:</h6>
                  <ul className="mb-0">
                    <li>Чтобы добавить участника, попросите его индивидуальный номер (формат: ARCTIC-XXXXX)</li>
                    <li>Нажмите "Метрики" чтобы просмотреть показатели участника</li>
                    <li>Руководитель автоматически добавлен в экспедицию как участник</li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'info' && (
              <div className="mt-4">
                <h5>Описание экспедиции</h5>
                <div className="card">
                  <div className="card-body">
                    {expedition.description ? (
                      <p style={{ whiteSpace: 'pre-wrap' }}>{expedition.description}</p>
                    ) : (
                      <p className="text-muted">
                        Описание не добавлено. Вы можете добавить описание при редактировании экспедиции.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpeditionDetailPage;