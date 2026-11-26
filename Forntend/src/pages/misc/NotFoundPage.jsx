import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotFoundPage = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();

  return (
    <div className="error-page-container">
      <div className="error-card animate-fade-in">
        <div className="error-icon-box">
          <HelpCircle size={48} className="text-primary" />
        </div>
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The deliverable, project, or screen you are attempting to access does not exist or may have been moved.
        </p>

        <div className="error-actions">
          {isAuthenticated ? (
            <Link to={getDashboardPath()} className="btn btn-primary">
              <Home size={16} /> Return to Dashboard
            </Link>
          ) : (
            <Link to="/" className="btn btn-primary">
              <ArrowLeft size={16} /> Return Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

