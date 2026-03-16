import React, { useMemo } from 'react';
import './VirtualPreview.css';

export default function VirtualPreview({ bodyShape, silhouette, neckline, sleeve }) {
  const shapeSrc = useMemo(() => {
    const s = (bodyShape || 'hourglass').toLowerCase();
    if (s.includes('pear')) return '/images/pear.png';
    if (s.includes('apple')) return '/images/apple.png';
    if (s.includes('rectangle')) return '/images/rectangle.png';
    return '/images/hourglass.png';
  }, [bodyShape]);

  const styleSrc = useMemo(() => {
    const val = (silhouette || '').toLowerCase();
    if (val.includes('sheath')) return '/images/sheath.png';
    if (val.includes('a') && val.includes('line')) return '/images/aline.png';
    if (val.includes('traditional')) return '/images/traditional.png';
    return '/images/aline.png';
  }, [silhouette]);

  const necklineSrc = useMemo(() => {
    const val = (neckline || '').toLowerCase();
    if (val.includes('v') && val.includes('neck')) return '/images/vneck.png';
    if (val.includes('boat')) return '/images/boat.png';
    return '/images/round.png';
  }, [neckline]);

  const sleeveSrc = useMemo(() => {
    const val = (sleeve || '').toLowerCase();
    if (val.includes('full')) return '/images/fullsleeve.png';
    if (val.includes('half') || val.includes('short') || val.includes('3/4')) return '/images/halfsleeve.png';
    return '/images/sleeveless.png';
  }, [sleeve]);

  const hideOnError = (e) => { e.currentTarget.style.display = 'none'; };

  return (
    <div className="vp-root">
      <div className="vp-title">Virtual Preview</div>
      <div className="vp-container">
        <img className="vp-layer body" src={shapeSrc} alt="body" onError={hideOnError} />
        <img className="vp-layer style" src={styleSrc} alt="style" onError={hideOnError} />
        <img className="vp-layer neckline" src={necklineSrc} alt="neckline" onError={hideOnError} />
        <img className="vp-layer sleeve" src={sleeveSrc} alt="sleeve" onError={hideOnError} />
      </div>
    </div>
  );
}
