import React from 'react';

export function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div style={{ height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="cards">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card" key={i}>
          <div className="card-title">&nbsp;</div>
          <div className="card-value">&nbsp;</div>
        </div>
      ))}
    </div>
  );
}