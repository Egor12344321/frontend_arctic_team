import { useState } from 'react';

function CreateExpeditionModal({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const getDateString = (date) => {
    return date.toISOString().split('T')[0];
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 8);

  if (!formData.startDate) {
    setFormData(prev => ({
      ...prev,
      startDate: getDateString(tomorrow),
      endDate: getDateString(nextWeek)
    }));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Название должно быть не менее 3 символов';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Дата начала обязательна';
    } else if (new Date(formData.startDate) < new Date()) {
      newErrors.startDate = 'Дата начала не может быть в прошлом';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Дата окончания обязательна';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'Дата окончания должна быть после даты начала';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        description: '',
        startDate: getDateString(tomorrow),
        endDate: getDateString(nextWeek)
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Create expedition error:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.message || 
        'Ошибка при создании экспедиции'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">🏔️ Создать новую экспедицию</h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {submitError && (
                <div className="alert alert-danger">
                  {submitError}
                </div>
              )}
              
              <div className="mb-3">
                <label className="form-label">
                  Название экспедиции *
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Например: Арктика-2024"
                  disabled={loading}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
                <div className="form-text">
                  Придумайте понятное название для экспедиции (3-100 символов)
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">
                  Описание экспедиции
                </label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Цели экспедиции, маршрут, особенности..."
                  disabled={loading}
                  maxLength="500"
                />
                <div className="form-text">
                  Описание поможет участникам понять цели экспедиции. Максимум 500 символов.
                  <span className="float-end">
                    {formData.description.length}/500
                  </span>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Дата начала *
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    disabled={loading}
                    min={getDateString(new Date())}
                  />
                  {errors.startDate && (
                    <div className="invalid-feedback">{errors.startDate}</div>
                  )}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Дата окончания *
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    disabled={loading}
                    min={formData.startDate}
                  />
                  {errors.endDate && (
                    <div className="invalid-feedback">{errors.endDate}</div>
                  )}
                </div>
              </div>
              
              <div className="alert alert-info">
                <h6>💡 Информация:</h6>
                <ul className="mb-0">
                  <li>После создания экспедиции вы сможете добавить участников</li>
                  <li>Участники добавляются по их индивидуальному номеру</li>
                  <li>Вы будете автоматически назначены руководителем этой экспедиции</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
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
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Создание...
                  </>
                ) : 'Создать экспедицию'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateExpeditionModal;