import React from 'react';

const COLORS = {
  Pending: '#f59e0b',
  'In Progress': '#3b82f6',
  Ready: '#10b981',
  Delivered: '#14b8a6',
  Cancelled: '#ef4444',
  Scheduled: '#8b5cf6',
  Completed: '#10b981'
};

export default function StatusPill({ label }) {
  const color = COLORS[label] || '#6b7280';
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      color
    }}>
      {label}
    </span>
  );
}