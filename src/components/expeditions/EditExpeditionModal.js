import { useState, useEffect } from 'react';
import axios from 'axios';

function EditExpeditionModal({ show, onClose, expedition, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (expedition) {
      setFormData({
        name: expedition.name || '',
        description: expedition.description || '',
        startDate: expedition.startDate ? expedition.startDate.split('T')[0] : '',
        endDate: expedition.endDate ? expedition.endDate.split('T')[0] : ''
      });
    }
  }, [expedition]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // onUpdate - это handleUpdateExpedition, который делает PUT
      await onUpdate(formData);
      // Модалка закроется в DashboardPage после успешного обновления
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при обновлении экспедиции');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      // onDelete - это handleDeleteExpedition, который делает DELETE
      await onDelete();
      // Модалка закроется в DashboardPage после успешного удаления
      // Не нужно вызывать onClose() здесь, это сделает DashboardPage
    } catch (error) {
      console.error('Delete error:', error);
      setError('Не удалось удалить экспедицию');
      setDeleteConfirm(false);
    }
  };

  if (!show || !expedition) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">✏️ Редактировать экспедицию</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <div className="mb-3">
                <label className="form-label">Название экспедиции *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Описание</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Дата начала *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Дата окончания *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="d-flex justify-content-between w-100">
                <div>
                  {!deleteConfirm ? (
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      🗑️ Удалить экспедицию
                    </button>
                  ) : (
                    <div className="d-flex gap-2">
                      <button 
                        type="button" 
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={loading}
                      >
                        ✅ Подтвердить удаление
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setDeleteConfirm(false)}
                        disabled={loading}
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <button 
                    type="button" 
                    className="btn btn-secondary me-2" 
                    onClick={onClose}
                    disabled={loading}
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditExpeditionModal;