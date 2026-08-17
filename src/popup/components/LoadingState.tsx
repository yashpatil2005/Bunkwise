import React from 'react';

export function LoadingState() {
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <div className="skeleton skeleton-number" />
      <div className="skeleton skeleton-text w-3/4" style={{ margin: '0 auto' }} />
      <div style={{ marginTop: '24px' }}>
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </div>
  );
}
