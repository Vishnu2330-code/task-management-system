import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { taskAPI } from '../../api/task.api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  User,
  Clock,
  Edit,
  Trash2,
  Tag,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';

export const TaskDetailsModal = ({
  isOpen,
  onClose,
  taskId,
  onEditTask,
  onDeleteTask,
  onTaskUpdated,
}) => {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('todo');

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const taskRes = await taskAPI.getTaskById(taskId);
      const taskDetails = taskRes.data.data.task;
      setTask(taskDetails);
      setSelectedStatus(taskDetails.status);
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    } else {
      setTask(null);
    }
  }, [isOpen, taskId, fetchTaskDetails]);

  const handleStatusSubmit = async () => {
    if (!task || selectedStatus === task.status) return;
    setStatusUpdating(true);
    try {
      const { data } = await taskAPI.updateStatus(task._id, selectedStatus);
      const updatedTask = data.data.task;
      setTask(updatedTask);
      setSelectedStatus(updatedTask.status);
      onTaskUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!task) return null;

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date();

  const canManageTask = user?.role === 'admin' || user?.role === 'manager';
  const canUpdateStatus =
    canManageTask ||
    (user?.role === 'member' && task.assignee?._id === user?._id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deliverable Details" maxWidth="750px">
      <div className="task-details-wrapper">
        {/* Header Bar */}
        <div className="task-details-header">
          <div className="task-badges-row">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {isOverdue && (
              <span className="badge-overdue-pill">
                <AlertCircle size={13} /> Overdue
              </span>
            )}
          </div>

          {canManageTask && (
            <div className="task-header-actions">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  onClose();
                  onEditTask(task);
                }}
              >
                <Edit size={14} /> Edit
              </button>
              <button
                className="btn btn-sm btn-danger-outline"
                onClick={() => {
                  onClose();
                  onDeleteTask(task);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h2 className="task-details-title">{task.title}</h2>
        <div className="task-details-description">
          {task.description ? (
            <p>{task.description}</p>
          ) : (
            <p className="text-muted italic">No detailed description provided.</p>
          )}
        </div>

        {/* Quick Status Select */}
        {canUpdateStatus && (
          <div className="task-status-control-box">
            <span className="status-control-label">Progress Status:</span>
            <div className="status-toggle-buttons">
              {['todo', 'in_progress', 'done'].map((st) => (
                <button
                  key={st}
                  className={`status-chip-btn ${selectedStatus === st ? 'active' : ''}`}
                  type="button"
                  aria-pressed={selectedStatus === st}
                  disabled={statusUpdating}
                  onClick={() => setSelectedStatus(st)}
                >
                  {st.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              disabled={statusUpdating || selectedStatus === task.status}
              onClick={handleStatusSubmit}
            >
              {statusUpdating ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        )}

        {/* Metadata Sidebar / Grid */}
        <div className="task-meta-grid">
          <div className="meta-card">
            <div className="meta-label">
              <User size={14} /> Assignee
            </div>
            <div className="meta-value">
              {task.assignee ? (
                <div className="flex-align-center gap-2">
                  <span className="avatar-xs-placeholder">
                    {task.assignee.name.charAt(0)}
                  </span>
                  <span>{task.assignee.name}</span>
                </div>
              ) : (
                <span className="text-muted">Unassigned</span>
              )}
            </div>
          </div>

          <div className="meta-card">
            <div className="meta-label">
              <Calendar size={14} /> Due Date
            </div>
            <div className={`meta-value ${isOverdue ? 'text-danger font-semibold' : ''}`}>
              {task.dueDate ? (
                new Date(task.dueDate).toLocaleDateString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              ) : (
                <span className="text-muted">No deadline</span>
              )}
            </div>
          </div>

          <div className="meta-card">
            <div className="meta-label">
              <FolderGit2 size={14} /> Project
            </div>
            <div className="meta-value font-medium">{task.project?.name || 'Project'}</div>
          </div>

          <div className="meta-card">
            <div className="meta-label">
              <Clock size={14} /> Created
            </div>
            <div className="meta-value text-xs text-muted">
              {new Date(task.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}{' '}
              by {task.creator?.name || 'System'}
            </div>
          </div>
        </div>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="task-labels-section">
            <span className="meta-label mb-1">
              <Tag size={13} /> Tags:
            </span>
            <div className="labels-wrap">
              {task.labels.map((l, i) => (
                <span key={i} className="task-label-tag">
                  #{l}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default TaskDetailsModal;
