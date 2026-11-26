import React from 'react';
import {
  Clock,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  UserMinus,
  MessageSquare,
  AlertCircle,
  FileEdit,
} from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';

export const ActivityTimeline = ({ activities = [] }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'PROJECT_CREATED':
      case 'TASK_CREATED':
        return <PlusCircle size={16} className="text-emerald-500" />;
      case 'STATUS_CHANGED':
        return <CheckCircle2 size={16} className="text-blue-500" />;
      case 'TASK_REASSIGNED':
        return <RefreshCw size={16} className="text-amber-500" />;
      case 'MEMBER_ADDED':
        return <UserCheck size={16} className="text-indigo-500" />;
      case 'MEMBER_REMOVED':
        return <UserMinus size={16} className="text-rose-500" />;
      case 'COMMENT_ADDED':
        return <MessageSquare size={16} className="text-violet-500" />;
      default:
        return <FileEdit size={16} className="text-slate-500" />;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="empty-timeline">
        <Clock size={28} className="text-muted" />
        <p className="text-sm text-muted">No activity records logged for this project yet.</p>
      </div>
    );
  }

  return (
    <div className="activity-timeline-wrapper">
      <div className="activity-timeline living-audit-trail">
        {/* Animated glowing vertical timeline trace spine */}
        <div className="timeline-glowing-spine" aria-hidden="true" />

        {activities.map((item, index) => (
          <ScrollReveal
            key={item._id || index}
            variant="fade-left"
            delay={(index % 6) * 35}
            duration={400}
            className="timeline-reveal-container"
          >
            <div className="timeline-node">
              <div className="timeline-icon-line">
                <div className="timeline-node-icon pulse-on-inview">
                  {getActionIcon(item.action)}
                </div>
                {index < activities.length - 1 && <div className="timeline-connector" />}
              </div>

              <div className="timeline-body card-interactive-lift">
                <div className="timeline-header">
                  <span className="timeline-actor">{item.actor?.name || 'Workspace User'}</span>
                  <span className="timeline-timestamp">
                    {new Date(item.timestamp || item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="timeline-details">{item.details}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
