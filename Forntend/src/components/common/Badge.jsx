import React from 'react';

export const StatusBadge = ({ status }) => {
  const configs = {
    todo: { label: 'To Do', className: 'badge-todo' },
    in_progress: { label: 'In Progress', className: 'badge-in-progress' },
    done: { label: 'Done', className: 'badge-done' },
  };

  const config = configs[status] || { label: status, className: 'badge-neutral' };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const configs = {
    low: { label: 'Low', className: 'badge-priority-low' },
    med: { label: 'Medium', className: 'badge-priority-med' },
    high: { label: 'High', className: 'badge-priority-high' },
  };

  const config = configs[priority] || { label: priority, className: 'badge-neutral' };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
};

export const RoleBadge = ({ role }) => {
  const configs = {
    admin: { label: 'Admin', className: 'badge-role-admin' },
    manager: { label: 'Manager', className: 'badge-role-manager' },
    member: { label: 'Member', className: 'badge-role-member' },
  };

  const config = configs[role] || { label: role, className: 'badge-neutral' };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
};

export default { StatusBadge, PriorityBadge, RoleBadge };

