import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import { taskAPI } from '../../api/task.api';

export const TaskModal = ({
  isOpen,
  onClose,
  task = null,
  projectId = null,
  projects = [],
  members = [],
  initialStatus = 'todo',
  onTaskSaved,
}) => {
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: projectId || '',
    status: initialStatus,
    priority: 'med',
    assignee: '',
    dueDate: '',
    labels: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || projectId || '',
        status: task.status || 'todo',
        priority: task.priority || 'med',
        assignee: task.assignee?._id || task.assignee || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        labels: task.labels ? task.labels.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        project: projectId || (projects[0]?._id || ''),
        status: initialStatus || 'todo',
        priority: 'med',
        assignee: '',
        dueDate: '',
        labels: '',
      });
    }
    setError('');
  }, [task, isOpen, projectId, projects, initialStatus]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      return setError('Task title is required');
    }

    if (!formData.project) {
      return setError('Please select an associated project');
    }

    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      project: formData.project,
      status: formData.status,
      priority: formData.priority,
      assignee: formData.assignee || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      labels: formData.labels
        ? formData.labels
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean)
        : [],
    };

    try {
      if (isEditing) {
        await taskAPI.updateTask(task._id, payload);
      } else {
        await taskAPI.createTask(payload);
      }
      onTaskSaved();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
          'Failed to save task'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task Details' : 'Create New Deliverable'}
      maxWidth="620px"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label className="form-label" htmlFor="task-title">Task Title *</label>
          <input
            id="task-title"
            name="title"
            type="text"
            className="form-input"
            placeholder="e.g. Implement TLS Ingress Routing"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            name="description"
            className="form-textarea"
            rows={3}
            placeholder="Detailed requirements, criteria, or testing guidelines..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          {!projectId && (
            <div className="form-group">
              <label className="form-label" htmlFor="task-project">Project *</label>
              <select
                id="task-project"
                name="project"
                className="form-select"
                value={formData.project}
                onChange={handleChange}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="task-assignee">Assignee</label>
            <select
              id="task-assignee"
              name="assignee"
              className="form-select"
              value={formData.assignee}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low Priority</option>
              <option value="med">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-due">Due Date</label>
            <input
              id="task-due"
              name="dueDate"
              type="date"
              className="form-input"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-labels">Labels (comma-separated)</label>
          <input
            id="task-labels"
            name="labels"
            type="text"
            className="form-input"
            placeholder="Security, DevOps, Backend"
            value={formData.labels}
            onChange={handleChange}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving Deliverable...' : isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;

