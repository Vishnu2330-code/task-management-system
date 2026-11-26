import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const TaskCard = ({
  task,
  onTaskClick,
}) => {
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className={`task-card ${isOverdue ? 'card-overdue' : ''}`}
      onClick={() => onTaskClick(task)}
    >
      <div className="task-card-top">
        <PriorityBadge priority={task.priority} />
        {isOverdue && (
          <span className="badge-overdue-pill">
            <AlertCircle size={12} /> Overdue
          </span>
        )}
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-desc-preview">
          {task.description.length > 90
            ? `${task.description.substring(0, 90)}...`
            : task.description}
        </p>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="task-card-labels">
          {task.labels.map((label, idx) => (
            <span key={idx} className="task-label-tag">
              #{label}
            </span>
          ))}
        </div>
      )}

      <div className="task-card-footer">
        <div className="task-assignee-info">
          {task.assignee ? (
            <div className="avatar-chip">
              <span className="avatar-letter">
                {task.assignee.name?.charAt(0) || 'U'}
              </span>
              <span className="assignee-name-sm">{task.assignee.name.split(' ')[0]}</span>
            </div>
          ) : (
            <span className="unassigned-text">Unassigned</span>
          )}
        </div>

        {formattedDueDate && (
          <div className={`due-date-indicator ${isOverdue ? 'text-danger' : ''}`}>
            <Calendar size={13} />
            <span>{formattedDueDate}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default TaskCard;
