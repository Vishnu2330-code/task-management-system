import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import { projectAPI } from '../../api/project.api';

export const ProjectModal = ({
  isOpen,
  onClose,
  project = null,
  availableUsers = [],
  onProjectSaved,
}) => {
  const isEditing = !!project;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    members: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        members: project.members ? project.members.map((m) => m._id || m) : [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
        members: [],
      });
    }
    setError('');
  }, [project, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const exists = prev.members.includes(userId);
      return {
        ...prev,
        members: exists
          ? prev.members.filter((id) => id !== userId)
          : [...prev.members, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      return setError('Project name is required');
    }

    setLoading(true);

    try {
      if (isEditing) {
        await projectAPI.updateProject(project._id, formData);
      } else {
        await projectAPI.createProject(formData);
      }
      onProjectSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project Settings' : 'Initialize New Project'}
      maxWidth="580px"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label className="form-label" htmlFor="proj-name">Project Name *</label>
          <input
            id="proj-name"
            name="name"
            type="text"
            className="form-input"
            placeholder="e.g. NextGen Cloud Platform"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="proj-desc">Project Overview</label>
          <textarea
            id="proj-desc"
            name="description"
            className="form-textarea"
            rows={3}
            placeholder="Project goals, milestone scopes, or deliverables..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {isEditing && (
          <div className="form-group">
            <label className="form-label" htmlFor="proj-status">Lifecycle Status</label>
            <select
              id="proj-status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Initial Team Collaborators</label>
          <div className="members-select-grid">
            {availableUsers.map((u) => {
              const isSelected = formData.members.includes(u._id);
              return (
                <div
                  key={u._id}
                  className={`member-choice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleMemberToggle(u._id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="checkbox-custom"
                  />
                  <div className="choice-info">
                    <span className="choice-name">{u.name}</span>
                    <span className="choice-role">{u.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Launch Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;

