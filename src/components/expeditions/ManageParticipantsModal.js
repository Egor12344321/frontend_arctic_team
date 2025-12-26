import { useState, useEffect } from 'react';
import axios from 'axios';

function ManageParticipantsModal({ show, onClose, expeditionId, expeditionName }) {
  const [participants, setParticipants] = useState([]);
  const [individualNumber, setIndividualNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (show && expeditionId) {
      loadParticipants();
    }
  }, [show, expeditionId]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/expeditions/${expeditionId}/participants`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setParticipants(response.data);
    } catch (error) {
      setError('Не удалось загрузить участников');
    } finally {
      setLoading(false);
    }
  };

  const searchUserByIndividualNumber = async () => {
    if (!individualNumber.trim()) {
      setError('Введите индивидуальный номер');
      return;
    }

    try {
      setSearching(true);
      setError('');
      const response = await axios.get(
        `http://localhost:8080/api/users/search?individualNumber=${individualNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setSearchResults([response.data]);
    } catch (error) {
      setSearchResults([]);
      setError('Пользователь не найден');
    } finally {
      setSearching(false);
    }
  };

  const addParticipant = async (individualNumber) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/expeditions/${expeditionId}/participants`,
        { individualNumber },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Участник добавлен:', response.data);
      await loadParticipants();
      setIndividualNumber('');
      setSearchResults([]);
      setError('');
    } catch (error) {
      console.error('Ошибка добавления:', error.response?.data);
      setError(error.response?.data?.message || 'Не удалось добавить участника');
    }
  };

  const removeParticipant = async (participantId) => {
    if (!window.confirm('Вы уверены, что хотите удалить участника из экспедиции?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/expeditions/${expeditionId}/participants/${participantId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      await loadParticipants();
      setError('');
    } catch (error) {
      setError('Не удалось удалить участника');
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              🧑‍🤝‍🧑 Участники экспедиции: {expeditionName}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card mb-4">
              <div className="card-header">Добавить участника</div>
              <div className="card-body">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Индивидуальный номер (ARCTIC-XXXXX)"
                    value={individualNumber}
                    onChange={(e) => setIndividualNumber(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={searchUserByIndividualNumber}
                    disabled={searching}
                  >
                    {searching ? 'Поиск...' : 'Найти'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="card">
                    <div className="card-body">
                      {searchResults.map(user => (
                        <div key={user.id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{user.firstName} {user.lastName}</strong>
                            <div className="text-muted small">
                              {user.email} • {user.individualNumber}
                            </div>
                          </div>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => addParticipant(user.individualNumber)}
                          >
                            Добавить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                Список участников ({participants.length})
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm"></div>
                    <p className="mt-2">Загружаем участников...</p>
                  </div>
                ) : participants.length === 0 ? (
                  <p className="text-muted text-center py-3">
                    В экспедиции пока нет участников
                  </p>
                ) : (
                  <div className="list-group">
                    {participants.map(participant => (
                      <div key={participant.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{participant.userFirstName} {participant.userLastName}</strong>
                          <div className="text-muted small">
                            {participant.userEmail} • {participant.userIndividualNumber}
                          </div>
                          <small className="text-muted">
                            Присоединился: {new Date(participant.joinedAt).toLocaleDateString()}
                          </small>
                        </div>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeParticipant(participant.id)}
                          title="Удалить из экспедиции"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageParticipantsModal;