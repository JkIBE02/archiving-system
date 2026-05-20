import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me')
};

export const userAPI = {
  getAll: () => api.get('/users'),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  uploadProfilePicture: (formData) => api.post('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const sectionAPI = {
  getAll: () => api.get('/sections'),
  getAllAdmin: () => api.get('/sections/all'),
  create: (data) => api.post('/sections', data),
  update: (id, data) => api.put(`/sections/${id}`, data),
  delete: (id) => api.delete(`/sections/${id}`)
};

export const schoolYearAPI = {
  getAll: () => api.get('/school-years'),
  getAllAdmin: () => api.get('/school-years/all'),
  create: (data) => api.post('/school-years', data),
  update: (id, data) => api.put(`/school-years/${id}`, data),
  delete: (id) => api.delete(`/school-years/${id}`)
};

export const documentAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  getMissingSubjects: (params) => api.get('/documents/missing-subjects', { params }),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  }),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => api.get(`/documents/download/${id}`, { responseType: 'blob' })
};

export const deadlineAPI = {
  getAll: (params) => api.get('/deadlines', { params }),
  create: (data) => api.post('/deadlines', data),
  update: (id, data) => api.put(`/deadlines/${id}`, data),
  delete: (id) => api.delete(`/deadlines/${id}`),
  getCompliance: (id) => api.get(`/deadlines/${id}/compliance`)
};

export default api;
