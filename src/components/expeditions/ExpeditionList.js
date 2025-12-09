import { useState } from 'react';

function ExpeditionList({ expeditions, showRole = true, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const calculateDays = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return '?';
    }
  };

  const handleExpeditionClick = (expeditionId) => {
    window.location.href = `/expeditions/${expeditionId}`;
  };

  const handleAddParticipants = (expeditionId, e) => {
    e.stopPropagation();
    console.log('Add participants to:', expeditionId);
  };

  return (
    <div className="expedition-list">
      {expeditions.map((expedition) => (
        <div 
          key={expedition.id} 
          className={`card mb-3 expedition-card ${expandedId === expedition.id ? 'border-primary' : ''}`}
          onClick={() => handleExpeditionClick(expedition.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="card-title mb-1">
                  {expedition.name}
                  {showRole && expedition.role && (
                    <span className={`badge ms-2 ${expedition.role === 'LEADER' ? 'bg-primary' : 'bg-success'}`}>
                      {expedition.role === 'LEADER' ? 'Руководитель' : 'Участник'}
                    </span>
                  )}
                </h5>
                
                <p className="card-text text-muted mb-2">
                  <small>
                    📅 {formatDate(expedition.startDate)} — {formatDate(expedition.endDate)} 
                    ({calculateDays(expedition.startDate, expedition.endDate)} дней)
                  </small>
                </p>

                <div className="expedition-info small">
                  <div className="text-muted">
                    <span className="me-3">
                      👤 Руководитель: {expedition.leaderFirstName} {expedition.leaderLastName}
                    </span>
                    <span>
                      📧 {expedition.leaderEmail}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dropdown">
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(expandedId === expedition.id ? null : expedition.id);
                  }}
                >
                  {expandedId === expedition.id ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {expandedId === expedition.id && (
              <div className="mt-3 pt-3 border-top">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Действия:</h6>
                    <div className="btn-group" role="group">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleExpeditionClick(expedition.id)}
                      >
                        📊 Просмотреть метрики
                      </button>
                      {expedition.role === 'LEADER' && (
                        <>
                          <button 
                            className="btn btn-sm btn-success ms-2"
                            onClick={(e) => handleAddParticipants(expedition.id, e)}
                          >
                            👥 Добавить участников
                          </button>
                          <button 
                            className="btn btn-sm btn-warning ms-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Edit expedition:', expedition.id);
                            }}
                          >
                            ✏️ Редактировать
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>Информация:</h6>
                    <ul className="list-unstyled small">
                      <li>🆔 ID: {expedition.id}</li>
                      <li>📅 Создана: {formatDateTime(expedition.createdAt)}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExpeditionList;