import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        { email, password },
        { withCredentials: true } 
      );
      console.log('=== RESPONSE RECEIVED ==='); // ← ДОБАВЬТЕ
      console.log('=== RESPONSE RECEIVED ==='); // ← ДОБАВЬТЕ
      console.log('Full response:', response.data);
      console.log('userRoles exists?', 'userRoles' in response.data);
      console.log('userRoles value:', response.data.userRoles);
      console.log('Type of userRoles:', typeof response.data.userRoles);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('userEmail', email);

      localStorage.setItem('userRoles', JSON.stringify(response.data.userRoles));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3>Вход в Arctic Metrics</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@arctic.ru"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Пароль:</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </form>
              
              <div className="mt-3 text-center">
                <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;