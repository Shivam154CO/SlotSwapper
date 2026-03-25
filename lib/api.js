const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = {
  get: (url) => makeRequest(url, 'GET'),
  post: (url, data) => makeRequest(url, 'POST', data),
  put: (url, data) => makeRequest(url, 'PUT', data),
  patch: (url, data) => makeRequest(url, 'PATCH', data),
  delete: (url) => makeRequest(url, 'DELETE'),
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function makeRequest(url, method, data = null, isRetry = false) {
  const fullUrl = `${API_BASE_URL}${url}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(fullUrl, config);

    // Parse response
    const text = await response.text();
    let responseData = text ? JSON.parse(text) : {};

    console.log(`API ${method} ${url}:`, {
      status: response.status,
      data: responseData
    });

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401 && !isRetry && !url.includes('/auth/login')) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            return makeRequest(url, method, data, true);
          }).catch(err => {
            throw err;
          });
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        isRefreshing = true;

        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          const refreshData = await refreshResponse.json();

          if (refreshData.success) {
            localStorage.setItem('token', refreshData.accessToken);
            if (refreshData.refreshToken) {
              localStorage.setItem('refreshToken', refreshData.refreshToken);
            }

            processQueue(null, refreshData.accessToken);
            return makeRequest(url, method, data, true);
          } else {
            throw new Error('Refresh token invalid');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Only clear if refresh explicitly failed (session expired)
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      const error = new Error(responseData.msg || responseData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = responseData;
      throw error;
    }

    return responseData;

  } catch (error) {
    console.error(`API ${method} ${url} failed:`, error);
    throw error;
  }
}

export default api;