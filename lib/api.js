// lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Helper function to check if we're in the browser
const isBrowser = () => typeof window !== 'undefined';

// Request interceptor to add auth token and debug requests
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (only in browser)
    if (isBrowser()) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 [API] Request with token: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.log(`⚠️ [API] Request without token: ${config.method?.toUpperCase()} ${config.url}`);
        // Don't throw error - let the backend handle authentication
      }
    }
    
    console.log(`🟡 [API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('❌ [API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and handling auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ [API] Error ${error.response?.status}:`, error.response?.data);
    
    // Don't auto-clear tokens or redirect - let components handle this
    if (error.response?.status === 401 && isBrowser()) {
      console.log('🛑 [API] Authentication failed');
      // Let the component decide what to do with 401 errors
    }
    
    return Promise.reject(error);
  }
);

export default api;