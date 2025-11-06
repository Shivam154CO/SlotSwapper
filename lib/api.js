import axios from 'axios';

// Debug: Check what environment variable is being used
console.log('[Frontend Debug] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.error('[Frontend Error] NEXT_PUBLIC_API_URL is not defined!');
  console.error('Make sure you have NEXT_PUBLIC_API_URL in your .env.local file');
}

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
    console.log('[Frontend] Full URL:', config.baseURL + config.url);
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
    console.error('[Frontend] Full error details:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response
    });
    return Promise.reject(error);
  }
);

export default api;