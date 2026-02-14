import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.url.includes('/auth/refresh') &&
        !originalRequest.url.includes('/auth/login')) {
      
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true } 
        );
        
        const newAccessToken = refreshResponse.data.accessToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  register: (userData) =>
    api.post('/auth/register', userData)
};

export const expeditionApi = {
  getMyExpeditions: () => 
    api.get('/expeditions/my'),
  
  createExpedition: (data) =>
    api.post('/expeditions', data),
  
  getExpeditionDetails: (id) =>
    api.get(`/expeditions/${id}`),
  
  getExpeditionParticipants: (expeditionId) =>
    api.get(`/expeditions/${expeditionId}/participants`),
  
  addParticipant: (expeditionId, individualNumber) =>
    api.post(`/expeditions/${expeditionId}/participants`, { individualNumber }),

  deleteExpedition: (expeditionId) =>
    api.delete(`/expeditions/${expeditionId}`),
  
  editExpedition: (expeditionId, data) =>
    api.put(`/expeditions/${expeditionId}`, data)
};

export default api;