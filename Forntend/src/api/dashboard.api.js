import api from './axios';

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getMemberWorkload: (projectId = null) =>
    api.get('/dashboard/workload', { params: { ...(projectId && { projectId }) } }),
  getProjectStats: (projectId) => api.get(`/dashboard/project/${projectId}`),
};

