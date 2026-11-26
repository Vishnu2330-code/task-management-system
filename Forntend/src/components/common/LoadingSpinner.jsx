import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`} />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export const FullPageLoader = ({ text = 'Loading workspace...' }) => {
  return (
    <div className="full-page-loader">
      <div className="spinner spinner-lg" />
      <h3 className="loader-title">{text}</h3>
      <p className="loader-subtitle">Synchronizing tasks and permissions</p>
    </div>
  );
};

export default LoadingSpinner;

