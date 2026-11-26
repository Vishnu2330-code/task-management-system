import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { Search, Filter, ArrowUpDown, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ScrollHorizontalShadow from '../common/ScrollHorizontalShadow';
import ScrollReveal from '../common/ScrollReveal';

export const KanbanBoard = ({
  tasks = [],
  onTaskClick,
  onAddTask,
  members = [],
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  // Client-side filtering & sorting for smooth UX
  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const matchSearch =
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.labels?.some((l) => l.toLowerCase().includes(search.toLowerCase()));
      if (!matchSearch) return false;
    }

    if (priorityFilter && t.priority !== priorityFilter) {
      return false;
    }

    if (assigneeFilter) {
      if (assigneeFilter === 'unassigned') {
        if (t.assignee) return false;
      } else {
        if (t.assignee?._id !== assigneeFilter) return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const weights = { high: 3, med: 2, low: 1 };
      return (weights[b.priority] || 0) - (weights[a.priority] || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Partition by status
  const todoTasks = sortedTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = sortedTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = sortedTasks.filter((t) => t.status === 'done');

  return (
    <div className="kanban-wrapper">
      {/* Controls Bar with Scroll-Sticky Elevation */}
      <div className="kanban-controls-bar sticky-kanban-controls">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Filter tasks by title, keyword, label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="kanban-filters-group">
          {/* Priority Filter */}
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="med">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Assignee Filter */}
          <select
            className="filter-select"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Sort Control */}
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Sort: Created Date</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Highest Priority</option>
          </select>

          {canCreate && (
            <button className="btn btn-primary" onClick={() => onAddTask('todo')}>
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Multi-Column Board with Dynamic Horizontal Scroll Shadows & Smooth Rail */}
      <ScrollHorizontalShadow showButtons={true} scrollAmount={340} className="kanban-horizontal-scroll-container">
        <div className="kanban-board-grid">
          <ScrollReveal variant="fade-up" delay={0} duration={500} className="kanban-col-wrapper">
            <KanbanColumn
              title="To Do"
              statusKey="todo"
              tasks={todoTasks}
              colorClass="dot-todo"
              onTaskClick={onTaskClick}
              canCreate={canCreate}
              onAddTask={onAddTask}
            />
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={80} duration={500} className="kanban-col-wrapper">
            <KanbanColumn
              title="In Progress"
              statusKey="in_progress"
              tasks={inProgressTasks}
              colorClass="dot-in-progress"
              onTaskClick={onTaskClick}
              canCreate={canCreate}
              onAddTask={onAddTask}
            />
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={160} duration={500} className="kanban-col-wrapper">
            <KanbanColumn
              title="Done"
              statusKey="done"
              tasks={doneTasks}
              colorClass="dot-done"
              onTaskClick={onTaskClick}
              canCreate={false}
              onAddTask={onAddTask}
            />
          </ScrollReveal>
        </div>
      </ScrollHorizontalShadow>
    </div>
  );
};

export default KanbanBoard;
