export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'API request failed');
  }
  
  if (response.status === 204) {
    return null;
  }
  
  const text = await response.text();
  if (!text) {
    return null;
  }
  return JSON.parse(text);
};

export default {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiFetch(endpoint, { 
    method: 'POST', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  put: (endpoint, data) => apiFetch(endpoint, { 
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
  patch: (endpoint, data) => apiFetch(endpoint, { 
    method: 'PATCH', 
    body: data ? JSON.stringify(data) : undefined 
  }),
};