import React from 'react';

export const Spinner = ({ size = 'md', label = 'Loading...' }) => (
  <div className={`spinner spinner--${size}`} role="status" aria-label={label}>
    <div className="spinner__ring" />
  </div>
);

export const LoadingState = ({ message = 'Loading...' }) => (
  <div className="loading-state">
    <Spinner size="lg" />
    <p className="loading-state__msg">{message}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="error-state" role="alert">
    <span className="error-state__icon">⚠️</span>
    <p className="error-state__msg">{message}</p>
    {onRetry && (
      <button className="btn btn--primary" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

export const EmptyState = ({ icon = '🔍', title, subtitle }) => (
  <div className="empty-state">
    <span className="empty-state__icon">{icon}</span>
    {title && <h3 className="empty-state__title">{title}</h3>}
    {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
  </div>
);
