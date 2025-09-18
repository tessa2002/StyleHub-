import React from 'react';

export default function EmptyState({ title = 'Nothing here yet', subtitle = 'Come back later or take an action to get started.', action }) {
  return (
    <div style={{
      padding: 20,
      border: '1px dashed rgba(255,255,255,0.15)',
      borderRadius: 12,
      background: 'rgba(255,255,255,0.02)',
      textAlign: 'center'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 10 }}>{subtitle}</div>
      {action}
    </div>
  );
}