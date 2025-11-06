import axios from 'axios';

// Use the Render backend URL directly
const API_BASE_URL = 'https://slotswapper-backend-mgiq.onrender.com/api';

console.log('[Frontend] Using API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[Frontend] Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Frontend] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[Frontend] Response received:`, response.status);
    return response;
  },
  (error) => {
    console.error('[Frontend] Error:',
      error.response?.status, 
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
);

export default api;