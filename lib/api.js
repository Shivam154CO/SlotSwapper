const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = {
  get: (url) => makeRequest(url, 'GET'),
  post: (url, data) => makeRequest(url, 'POST', data),
  put: (url, data) => makeRequest(url, 'PUT', data),
  patch: (url, data) => makeRequest(url, 'PATCH', data),
  delete: (url) => makeRequest(url, 'DELETE'),
};

async function makeRequest(url, method, data = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    const text = await response.text();
    let responseData;
    
    if (text) {
      responseData = JSON.parse(text);
    } else {
      responseData = {};
    }

    console.log(`API ${method} ${url}:`, {
      status: response.status,
      data: responseData
    });

    if (!response.ok) {
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