import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your criteria or currently available in this view.',
  action = null,
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-icon-circle">
        <Icon size={32} />
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-description">{description}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;

