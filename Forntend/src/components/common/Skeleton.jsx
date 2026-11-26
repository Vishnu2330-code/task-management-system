import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', style = {} }) => {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <Skeleton width="40%" height="24px" style={{ marginBottom: '12px' }} />
      <Skeleton width="90%" height="16px" style={{ marginBottom: '8px' }} />
      <Skeleton width="70%" height="16px" style={{ marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="30%" height="28px" borderRadius="14px" />
        <Skeleton width="28px" height="28px" borderRadius="50%" />
      </div>
    </div>
  );
};

export default Skeleton;

