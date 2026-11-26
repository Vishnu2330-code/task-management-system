import api from './axios';

export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getProjectMembers: () => api.get('/users/project-members'),
};
