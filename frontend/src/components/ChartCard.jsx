import React from 'react';

const ChartCard = ({ title, loading, error, children, onAction, actionLabel = 'View Details' }) => {
  return (
    <div className="chart-card" role="region" aria-label={title}>
      <div className="chart-header">
        <div className="chart-title">{title}</div>
        {onAction ? (
          <button className="btn btn-secondary" onClick={onAction}>{actionLabel}</button>
        ) : null}
      </div>
      {loading ? (
        <div className="chart-placeholder" aria-live="polite">Loading chart...</div>
      ) : error ? (
        <div className="chart-placeholder" role="alert">{error}</div>
      ) : (
        children || <div className="chart-placeholder">Chart goes here</div>
      )}
    </div>
  );
};

export default ChartCard;









































