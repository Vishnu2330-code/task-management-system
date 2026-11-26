import api from './axios';

export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getTaskComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
};

