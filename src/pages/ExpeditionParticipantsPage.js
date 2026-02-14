import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ExpeditionParticipantsPage() {
  const { id } = useParams(); // expeditionId
  const navigate = useNavigate();
  
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadParticipants();
  }, [id]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `http://localhost:8080/api/expeditions/${id}/participants`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      setParticipants(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load participants:', error);
      setError('Не удалось загрузить участников');
      setLoading(false);
    }
  };

  const handleViewMetrics = (participantId) => {
    navigate(`/expeditions/${id}/participants/${participantId}/metrics`);
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
        <p className="mt-3">Загружаем участников...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button onClick={handleBack} className="btn btn-outline-secondary me-3">
            ← Назад
          </button>
          <h2 className="d-inline">👥 Участники экспедиции</h2>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {participants.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5>Нет участников</h5>
            <p className="text-muted">В экспедиции пока нет участников</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Список участников ({participants.length})</h5>
          </div>
          <div className="card-body">
            <div className="list-group">
              {participants.map(participant => (
                <div key={participant.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{participant.userFirstName} {participant.userLastName}</strong>
                      <div className="text-muted small">
                        {participant.userEmail} • {participant.userIndividualNumber}
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewMetrics(participant.id)}
                    >
                      📊 Метрики
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpeditionParticipantsPage;