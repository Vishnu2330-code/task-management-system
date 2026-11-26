import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Briefcase, CheckSquare, Layers } from 'lucide-react';
import ScrollProgressBar from '../common/ScrollProgressBar';

export const AuthLayout = ({ children, title, subtitle, roleTheme = 'member' }) => {
  const location = useLocation();

  const themes = {
    admin: {
      accent: 'theme-admin',
      badge: 'Admin Security Gateway',
      badgeIcon: ShieldCheck,
      badgeColor: 'badge-admin-portal',
      progressClass: 'progress-admin',
    },
    manager: {
      accent: 'theme-manager',
      badge: 'Management & Strategy Portal',
      badgeIcon: Briefcase,
      badgeColor: 'badge-manager-portal',
      progressClass: 'progress-manager',
    },
    member: {
      accent: 'theme-member',
      badge: 'Collaborator & Member Workspace',
      badgeIcon: CheckSquare,
      badgeColor: 'badge-member-portal',
      progressClass: 'progress-member',
    },
  };

  const currentTheme = themes[roleTheme] || themes.member;
  const BadgeIcon = currentTheme.badgeIcon;

  return (
    <div className={`auth-page-container ${currentTheme.accent} auth-scroll-experience`}>
      {/* Top subtle scroll progress bar */}
      <ScrollProgressBar colorClass={currentTheme.progressClass} height={3} />

      {/* Ambient animated floating light beams */}
      <div className="auth-ambient-beams" aria-hidden="true">
        <div className="auth-beam beam-1" />
        <div className="auth-beam beam-2" />
      </div>

      <div className="auth-mesh-bg" />
      <div className="auth-card auth-card-3d animate-fade-in">
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            <div className="auth-logo-box">
              <Layers size={22} className="text-white" />
            </div>
            <span className="auth-brand-title">TaskFlow</span>
          </Link>

          <div className={`portal-indicator-pill ${currentTheme.badgeColor}`}>
            <BadgeIcon size={14} />
            <span>{currentTheme.badge}</span>
          </div>

          <h1 className="auth-page-title">{title}</h1>
          {subtitle && <p className="auth-page-subtitle">{subtitle}</p>}
        </div>

        {/* Portal Quick Switch Tabs */}
        <div className="portal-switcher-tabs">
          <Link
            to="/login/admin"
            className={`portal-tab ${location.pathname === '/login/admin' ? 'active tab-admin' : ''}`}
          >
            <ShieldCheck size={14} /> Admin
          </Link>
          <Link
            to="/login/manager"
            className={`portal-tab ${location.pathname === '/login/manager' ? 'active tab-manager' : ''}`}
          >
            <Briefcase size={14} /> Manager
          </Link>
          <Link
            to="/login/member"
            className={`portal-tab ${location.pathname === '/login/member' ? 'active tab-member' : ''}`}
          >
            <CheckSquare size={14} /> Member
          </Link>
        </div>

        <div className="auth-card-body">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
