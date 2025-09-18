import React from 'react';

export default function BrandHeader({ align = 'center' }) {
  return (
    <div className={`brand-header ${align}`}>
      <img src="/stylehub-logo.png" alt="Style Hub logo" className="brand-logo" />
      <span className="brand-name">Style Hub</span>
    </div>
  );
}