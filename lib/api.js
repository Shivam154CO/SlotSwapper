import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const isBrowser = () => typeof window !== 'undefined';

api.interceptors.request.use(
  (config) => {
    if (isBrowser()) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API] Request with token: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.log(`[API] Request without token: ${config.method?.toUpperCase()} ${config.url}`);
      }
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API] Error ${error.response?.status}:`, error.response?.data);
    
    if (error.response?.status === 401 && isBrowser()) {
      console.log('[API] Authentication failed');
    }
    
    return Promise.reject(error);
  }
);

export default api;