import React from 'react';
import { useScrollSpy } from '../../hooks/useScrollAnimations';

/**
 * Floating Quick-Jump ScrollSpy Navigator
 * Perfect for executive dashboards, project details, and long documents.
 */
export const ScrollSpyNav = ({
  items = [], // [{ id: 'overview', label: 'Overview', icon: LucideIcon }]
  className = '',
  offset = 120,
}) => {
  const sectionIds = items.map((item) => item.id);
  const { activeId, scrollToSection } = useScrollSpy(sectionIds, offset);

  if (!items.length) return null;

  return (
    <nav className={`scroll-spy-dock ${className}`} aria-label="Quick section navigation">
      <div className="scroll-spy-pill-container">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`scroll-spy-item ${isActive ? 'is-active' : ''}`}
              onClick={() => scrollToSection(item.id, offset - 20)}
              aria-current={isActive ? 'true' : undefined}
            >
              {Icon && <Icon size={14} className="scroll-spy-icon" />}
              <span className="scroll-spy-label">{item.label}</span>
              {isActive && <div className="scroll-spy-active-indicator" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ScrollSpyNav;
