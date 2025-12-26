import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyMetricsPage() {
  const { expeditionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState(null);
  const [expedition, setExpedition] = useState(null);

  useEffect(() => {
    loadData();
  }, [expeditionId]);

  const loadData = async () => {
    try {
      const expeditionResponse = await axios.get(
        `http://localhost:8080/api/expeditions/${expeditionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      setExpedition(expeditionResponse.data);

      const chartsResponse = await axios.get(
        `http://localhost:8080/api/expeditions/${expeditionId}/charts/my`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );
      
      setCharts(chartsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/expeditions/${expeditionId}`);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Загружаем ваши метрики...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button onClick={handleBack} className="btn btn-outline-secondary me-3">
            ← Назад к экспедиции
          </button>
          <h2 className="d-inline">📊 Мои метрики</h2>
          {expedition && (
            <p className="text-muted mb-0">
              Экспедиция: {expedition.name}
            </p>
          )}
        </div>
      </div>

      {charts?.stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h5>😴 Усталость</h5>
                <h3 className="text-warning">{charts.stats.fatigue?.avg || '—'}</h3>
                <small className="text-muted">
                  мин: {charts.stats.fatigue?.min || '—'} / 
                  макс: {charts.stats.fatigue?.max || '—'}
                </small>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h5>❤️ Пульс</h5>
                <h3 className="text-danger">{charts.stats.heart_rate?.avg || '—'}</h3>
                <small className="text-muted">
                  мин: {charts.stats.heart_rate?.min || '—'} / 
                  макс: {charts.stats.heart_rate?.max || '—'}
                </small>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h5>🎯 Концентрация</h5>
                <h3 className="text-success">{charts.stats.concentration?.avg || '—'}</h3>
                <small className="text-muted">
                  мин: {charts.stats.concentration?.min || '—'} / 
                  макс: {charts.stats.concentration?.max || '—'}
                </small>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h5>📈 Продуктивность</h5>
                <h3 className="text-primary">{charts.stats.productivity?.avg || '—'}</h3>
                <small className="text-muted">
                  мин: {charts.stats.productivity?.min || '—'} / 
                  макс: {charts.stats.productivity?.max || '—'}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Графики */}
      <div className="row">
        {charts?.charts?.fatigue_chart && (
          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-header">
                <h5>📈 Динамика усталости и концентрации</h5>
              </div>
              <div className="card-body">
                <div dangerouslySetInnerHTML={{ __html: charts.charts.fatigue_chart }} />
              </div>
            </div>
          </div>
        )}
        
        {charts?.charts?.heart_rate_chart && (
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5>❤️ Частота сердечных сокращений</h5>
              </div>
              <div className="card-body">
                <div dangerouslySetInnerHTML={{ __html: charts.charts.heart_rate_chart }} />
              </div>
            </div>
          </div>
        )}
        
        {charts?.charts?.composite_chart && (
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5>📊 Комбинированные показатели</h5>
              </div>
              <div className="card-body">
                <div dangerouslySetInnerHTML={{ __html: charts.charts.composite_chart }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Информация о данных */}
      {charts && (
        <div className="alert alert-info">
          <div className="row">
            <div className="col-md-4">
              <h6>👤 Участник:</h6>
              <p className="mb-0">{localStorage.getItem('userEmail')}</p>
            </div>
            <div className="col-md-4">
              <h6>📅 Период:</h6>
              <p className="mb-0">{charts.period || 'Не указано'}</p>
            </div>
            <div className="col-md-4">
              <h6>📊 Измерений:</h6>
              <p className="mb-0">{charts.total_measurements || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyMetricsPage;