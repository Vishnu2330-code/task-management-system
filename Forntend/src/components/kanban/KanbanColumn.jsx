import React from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

export const KanbanColumn = ({
  title,
  statusKey,
  tasks = [],
  colorClass = '',
  onTaskClick,
  canCreate = false,
  onAddTask,
}) => {
  return (
    <div className={`kanban-column column-${statusKey}`}>
      <div className="kanban-column-header">
        <div className="column-title-group">
          <span className={`column-status-dot ${colorClass}`} />
          <h3 className="column-title">{title}</h3>
          <span className="column-count-badge">{tasks.length}</span>
        </div>

        {canCreate && (
          <button
            className="column-add-btn"
            title={`Add new task to ${title}`}
            onClick={() => onAddTask(statusKey)}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="kanban-cards-container">
        {tasks.length === 0 ? (
          <div className="empty-column-placeholder">
            <p>No tasks in {title.toLowerCase()}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
