import api from './axios';

export const commentAPI = {
  createComment: (data) => api.post('/comments', data),
  updateComment: (id, content) => api.put(`/comments/${id}`, { content }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

