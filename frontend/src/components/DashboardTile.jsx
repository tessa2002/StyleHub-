import React from 'react';

const DashboardTile = ({ title, value, icon: Icon, bgGradient, subtitle, loading, error, onClick }) => {
  return (
    <div className="stat-card" role="region" aria-label={title} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        <div className="stat-icon" style={{ background: bgGradient }}>
          {Icon ? <Icon /> : null}
        </div>
      </div>
      {loading ? (
        <div className="tile-loading" aria-live="polite">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="tile-error" role="alert">{error}</div>
      ) : (
        <>
          <div className="stat-value">{value}</div>
          {subtitle ? <div className="stat-change">{subtitle}</div> : null}
        </>
      )}
    </div>
  );
};

export default DashboardTile;





