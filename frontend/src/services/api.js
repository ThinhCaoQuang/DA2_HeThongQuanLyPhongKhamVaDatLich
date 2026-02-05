import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// BenhNhan API
export const benhNhanAPI = {
  getAll: () => api.get('/benhnhan'),
  getById: (id) => api.get(`/benhnhan/${id}`),
  create: (data) => api.post('/benhnhan', data),
  update: (id, data) => api.put(`/benhnhan/${id}`, data),
  delete: (id) => api.delete(`/benhnhan/${id}`)
};

// ChuyenKhoa API
export const chuyenKhoaAPI = {
  getAll: () => api.get('/chuyenkhoa'),
  getById: (id) => api.get(`/chuyenkhoa/${id}`),
  create: (data) => api.post('/chuyenkhoa', data),
  update: (id, data) => api.put(`/chuyenkhoa/${id}`, data),
  delete: (id) => api.delete(`/chuyenkhoa/${id}`)
};

// BacSi API
export const bacSiAPI = {
  getAll: () => api.get('/bacsi'),
  getById: (id) => api.get(`/bacsi/${id}`),
  create: (data) => api.post('/bacsi', data),
  update: (id, data) => api.put(`/bacsi/${id}`, data),
  delete: (id) => api.delete(`/bacsi/${id}`)
};

// LichKham API
export const lichKhamAPI = {
  getAll: () => api.get('/lichkham'),
  getById: (id) => api.get(`/lichkham/${id}`),
  create: (data) => api.post('/lichkham', data),
  update: (id, data) => api.put(`/lichkham/${id}`, data),
  delete: (id) => api.delete(`/lichkham/${id}`),
  confirm: (id) => api.patch(`/lichkham/${id}/confirm`),
  cancel: (id) => api.patch(`/lichkham/${id}/cancel`)
};

export default api;
