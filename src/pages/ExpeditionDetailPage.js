import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ExpeditionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expedition, setExpedition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExpeditionDetails();
  }, [id]);

  const loadExpeditionDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/expeditions/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      setExpedition(response.data);
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

  const handleBack = () => {
    navigate('/dashboard');
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
          <div className="card-body">
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
                <h5>Статистика</h5>
                <div className="row text-center">
                  <div className="col">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3>👥</h3>
                        <h4>0</h4>
                        <p className="text-muted">Участников</p>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3>📊</h3>
                        <h4>0</h4>
                        <p className="text-muted">Метрик</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5>Действия</h5>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary">
                      👥 Управление участниками
                    </button>
                    <button className="btn btn-success">
                      📊 Просмотреть метрики
                    </button>
                    {expedition.role === 'LEADER' && (
                      <>
                        <button className="btn btn-warning">
                          ✏️ Редактировать экспедицию
                        </button>
                        <button className="btn btn-danger">
                          🗑️ Удалить экспедицию
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h5>Описание экспедиции</h5>
              <div className="card">
                <div className="card-body">
                  {expedition.description ? (
                    <p>{expedition.description}</p>
                  ) : (
                    <p className="text-muted">
                      Описание не добавлено. Вы можете добавить описание при редактировании экспедиции.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpeditionDetailPage;