import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../../components/common/Badge';

export const UnauthorizedPage = () => {
  const { user, getDashboardPath, logout } = useAuth();

  return (
    <div className="error-page-container">
      <div className="error-card animate-fade-in">
        <div className="error-icon-box box-danger">
          <ShieldAlert size={48} className="text-danger" />
        </div>
        <h1 className="error-code text-danger">403</h1>
        <h2 className="error-title">Access Restricted</h2>
        <p className="error-message">
          You are signed in as a <RoleBadge role={user?.role} />. Your assigned role lacks authorization to access this administrative or managerial resource.
        </p>

        <div className="error-actions">
          <Link to={getDashboardPath()} className="btn btn-primary">
            <Home size={16} /> My Permitted Dashboard
          </Link>
          <button className="btn btn-secondary" onClick={logout}>
            <LogOut size={16} /> Sign In with Different Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

