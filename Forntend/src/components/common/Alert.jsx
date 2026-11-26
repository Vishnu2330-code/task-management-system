import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const icons = {
    error: <AlertCircle size={18} className="text-red-500" />,
    success: <CheckCircle size={18} className="text-green-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  return (
    <div className={`alert-banner alert-${type}`}>
      <div className="alert-body">
        {icons[type]}
        <span className="alert-text">{message}</span>
      </div>
      {onClose && (
        <button className="alert-close-btn" onClick={onClose} aria-label="Dismiss alert">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;

