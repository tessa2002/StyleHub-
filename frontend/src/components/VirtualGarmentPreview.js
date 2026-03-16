import React, { useMemo } from 'react';
import './VirtualGarmentPreview.css';

/**
 * 2D Virtual Garment Preview Component
 * Displays body silhouette with garment overlay using layered images
 */
const VirtualGarmentPreview = ({
  garmentType,
  bodyShape,
  silhouette,
  neckline,
  sleeve,
  selectedFabric,
  measurements
}) => {
  
  // Determine body type image based on body shape
  const bodyImagePath = useMemo(() => {
    const bodyType = bodyShape?.toLowerCase() || 'hourglass';
    return `/images/${bodyType}_body.png`;
  }, [bodyShape]);
  
  // Determine garment image based on garment type and silhouette
  const garmentImagePath = useMemo(() => {
    const garment = garmentType?.toLowerCase().replace(/\s+/g, '_') || 'kurthi';
    const style = silhouette?.toLowerCase().replace(/\s+/g, '_') || 'a_line';
    return `/images/${garment}_${style}.png`;
  }, [garmentType, silhouette]);
  
  const necklineImagePath = useMemo(() => {
    const name = neckline?.toLowerCase().replace(/\s+/g, '_') || 'round';
    return `/images/neckline_${name}.png`;
  }, [neckline]);
  
  const sleeveImagePath = useMemo(() => {
    const name = sleeve?.toLowerCase().replace(/\s+/g, '_') || 'sleeveless';
    return `/images/sleeve_${name}.png`;
  }, [sleeve]);
  
  // Fallback images if specific ones don't exist
  const handleBodyImageError = (e) => {
    e.target.src = '/images/default_body.png';
  };
  
  const handleGarmentImageError = (e) => {
    e.target.src = '/images/default_garment.png';
  };
  
  const handleNecklineImageError = (e) => {
    e.target.style.display = 'none';
  };
  
  const handleSleeveImageError = (e) => {
    e.target.style.display = 'none';
  };
  
  return (
    <div className="virtual-garment-preview">
      <div className="preview-title">Virtual Preview</div>
      <div className="preview-container">
        {/* Base Layer: Body Silhouette */}
        <img 
          src={bodyImagePath}
          alt={`${bodyShape} body type`}
          className="body-layer"
          onError={handleBodyImageError}
        />
        
        {/* Overlay Layer: Garment */}
        <img 
          src={garmentImagePath}
          alt={`${garmentType} ${silhouette}`}
          className="garment-layer"
          onError={handleGarmentImageError}
          style={{
            filter: selectedFabric?.color ? `hue-rotate(${getHueRotation(selectedFabric.color)}deg)` : 'none'
          }}
        />
        
        {/* Overlay Layer: Neckline */}
        <img 
          src={necklineImagePath}
          alt={`neckline ${neckline}`}
          className="neckline-layer"
          onError={handleNecklineImageError}
        />
        
        {/* Overlay Layer: Sleeve */}
        <img 
          src={sleeveImagePath}
          alt={`sleeve ${sleeve}`}
          className="sleeve-layer"
          onError={handleSleeveImageError}
        />
      </div>
      
      {/* Info Badges */}
      <div className="preview-info-badges">
        <div className="info-badge">
          <span className="badge-label">Body Type:</span>
          <span className="badge-value">{bodyShape || 'Custom'}</span>
        </div>
        <div className="info-badge">
          <span className="badge-label">Garment:</span>
          <span className="badge-value">{garmentType}</span>
        </div>
        <div className="info-badge">
          <span className="badge-label">Style:</span>
          <span className="badge-value">{silhouette}</span>
        </div>
        {selectedFabric && (
          <div className="info-badge">
            <span className="badge-label">Fabric:</span>
            <span className="badge-value">{selectedFabric.name}</span>
          </div>
        )}
      </div>
      
      {/* Measurement Indicators */}
      {measurements && (
        <div className="measurement-display">
          <div className="measurement-item">
            <span className="measurement-label">Chest:</span>
            <span className="measurement-value">{measurements.Chest || measurements.chest}"</span>
          </div>
          <div className="measurement-item">
            <span className="measurement-label">Waist:</span>
            <span className="measurement-value">{measurements.Waist || measurements.waist}"</span>
          </div>
          <div className="measurement-item">
            <span className="measurement-label">Hips:</span>
            <span className="measurement-value">{measurements.Hips || measurements.hips}"</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to convert color to hue rotation
const getHueRotation = (color) => {
  if (!color) return 0;
  
  // Simple color to hue mapping
  const colorMap = {
    'red': 0,
    'pink': 330,
    'purple': 270,
    'blue': 240,
    'cyan': 180,
    'green': 120,
    'yellow': 60,
    'orange': 30,
  };
  
  const colorLower = color.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (colorLower.includes(key)) {
      return value;
    }
  }
  
  return 0;
};

export default VirtualGarmentPreview;
