import React, { useMemo } from 'react';
import './DynamicGarmentPreview.css';

/**
 * DynamicGarmentPreview Component
 * Renders a realistic body avatar with garment visualization based on measurements and customizations
 */
const DynamicGarmentPreview = ({ 
  garmentType, 
  measurements, 
  bodyShape,
  silhouette, 
  neckline, 
  sleeve,
  selectedFabric,
  hasLining,
  hasEmbroidery,
  embroideryDetails
}) => {
  
  // Calculate body proportions from measurements
  const bodyProportions = useMemo(() => {
    if (!measurements) return null;
    
    const chest = parseFloat(measurements.Chest || measurements.chest || 36);
    const waist = parseFloat(measurements.Waist || measurements.waist || 30);
    const hips = parseFloat(measurements.Hips || measurements.hips || 38);
    const height = parseFloat(measurements.Height || measurements.height || 65);
    const shoulder = parseFloat(measurements.Shoulder || measurements.shoulder || 15);
    
    // Normalize to percentage scale for SVG rendering (base scale on chest)
    const baseWidth = chest;
    
    return {
      chest: chest,
      waist: waist,
      hips: hips,
      height: height,
      shoulder: shoulder,
      // Normalized percentages for rendering
      chestWidth: (chest / baseWidth) * 100,
      waistWidth: (waist / baseWidth) * 100,
      hipsWidth: (hips / baseWidth) * 100,
      shoulderWidth: (shoulder / baseWidth) * 100,
      heightScale: height / 65, // Normalize to average height
      // Calculate ratios for body shape
      bustToHipRatio: chest / hips,
      waistToHipRatio: waist / hips,
      waistToBustRatio: waist / chest,
    };
  }, [measurements]);

  // Generate realistic body silhouette based on measurements
  const generateBodySilhouette = () => {
    if (!bodyProportions) return null;
    
    const { chestWidth, waistWidth, hipsWidth, shoulderWidth, heightScale } = bodyProportions;
    const centerX = 200;
    
    // Vertical positions (scaled by height)
    const headTop = 20;
    const neckY = 60 * heightScale;
    const shoulderY = 80 * heightScale;
    const chestY = 140 * heightScale;
    const waistY = 200 * heightScale;
    const hipY = 260 * heightScale;
    const thighY = 320 * heightScale;
    const kneeY = 380 * heightScale;
    const ankleY = 440 * heightScale;
    
    // Calculate widths at each body point (in pixels, scaled appropriately)
    const scale = 0.7; // Overall scale factor
    const shoulderLeft = centerX - (shoulderWidth * scale);
    const shoulderRight = centerX + (shoulderWidth * scale);
    const chestLeft = centerX - (chestWidth * scale);
    const chestRight = centerX + (chestWidth * scale);
    const waistLeft = centerX - (waistWidth * scale);
    const waistRight = centerX + (waistWidth * scale);
    const hipLeft = centerX - (hipsWidth * scale);
    const hipRight = centerX + (hipsWidth * scale);
    const thighLeft = centerX - (hipsWidth * scale * 0.85);
    const thighRight = centerX + (hipsWidth * scale * 0.85);
    const kneeLeft = centerX - (hipsWidth * scale * 0.5);
    const kneeRight = centerX + (hipsWidth * scale * 0.5);
    const ankleLeft = centerX - (hipsWidth * scale * 0.35);
    const ankleRight = centerX + (hipsWidth * scale * 0.35);
    
    // Build body path
    let bodyPath = `M ${shoulderLeft} ${shoulderY} `; // Start left shoulder
    
    // Left side of body
    bodyPath += `L ${chestLeft} ${chestY} `; // Down to chest
    bodyPath += `Q ${waistLeft} ${waistY} ${hipLeft} ${hipY} `; // Curve to waist and hip
    bodyPath += `L ${thighLeft} ${thighY} `; // Down to thigh
    bodyPath += `L ${kneeLeft} ${kneeY} `; // Down to knee
    bodyPath += `L ${ankleLeft} ${ankleY} `; // Down to ankle
    
    // Bottom (feet)
    bodyPath += `L ${ankleRight} ${ankleY} `;
    
    // Right side of body (mirror)
    bodyPath += `L ${kneeRight} ${kneeY} `;
    bodyPath += `L ${thighRight} ${thighY} `;
    bodyPath += `Q ${hipRight} ${hipY} ${waistRight} ${waistY} `;
    bodyPath += `L ${chestRight} ${chestY} `;
    bodyPath += `L ${shoulderRight} ${shoulderY} `;
    
    // Neck and close
    bodyPath += `L ${centerX + 15} ${neckY} `; // Right neck
    bodyPath += `L ${centerX - 15} ${neckY} `; // Left neck
    bodyPath += `Z`;
    
    return {
      bodyPath,
      headCenterX: centerX,
      headCenterY: headTop + 20,
      neckY,
      shoulderY,
      chestY,
      waistY,
      hipY,
      shoulderLeft,
      shoulderRight,
      chestLeft,
      chestRight,
      waistLeft,
      waistRight,
      hipLeft,
      hipRight
    };
  };

  const bodyData = generateBodySilhouette();
  // Generate SVG path for garment based on body type and customizations
  const generateGarmentPath = () => {
    if (!bodyProportions || !bodyData) return '';
    
    const { shoulderLeft, shoulderRight, chestLeft, chestRight, waistLeft, waistRight, hipLeft, hipRight, shoulderY, chestY, waistY, hipY } = bodyData;
    
    // Adjust garment length based on type
    let hemY = hipY + 80;
    
    if (garmentType === 'Short Kurthi' || garmentType === 'Crop Top & Skirt') {
      hemY = hipY + 40;
    } else if (garmentType === 'Kurthi') {
      hemY = hipY + 100;
    } else if (garmentType === 'Gown' || garmentType === 'Anarkali' || garmentType === 'Lehenga') {
      hemY = hipY + 140;
    }
    
    // Calculate garment widths based on silhouette
    let garmentWaistLeft = waistLeft;
    let garmentWaistRight = waistRight;
    let garmentHipLeft = hipLeft;
    let garmentHipRight = hipRight;
    let garmentHemLeft = hipLeft;
    let garmentHemRight = hipRight;
    
    const centerX = 200;
    
    if (silhouette === 'A-Line') {
      garmentHemLeft = centerX - (bodyProportions.hipsWidth * 0.9);
      garmentHemRight = centerX + (bodyProportions.hipsWidth * 0.9);
    } else if (silhouette === 'Mermaid') {
      garmentHipLeft = hipLeft - 5;
      garmentHipRight = hipRight + 5;
      garmentHemLeft = centerX - (bodyProportions.hipsWidth * 1.1);
      garmentHemRight = centerX + (bodyProportions.hipsWidth * 1.1);
    } else if (silhouette === 'Empire') {
      garmentWaistLeft = chestLeft;
      garmentWaistRight = chestRight;
      garmentHemLeft = centerX - (bodyProportions.hipsWidth * 0.95);
      garmentHemRight = centerX + (bodyProportions.hipsWidth * 0.95);
    } else if (silhouette === 'Sheath') {
      garmentHemLeft = hipLeft + 5;
      garmentHemRight = hipRight - 5;
    }
    
    // Build garment path
    let path = `M ${shoulderLeft + 5} ${shoulderY + 10} `; // Start left shoulder
    
    // Left side
    path += `L ${chestLeft + 3} ${chestY} `;
    path += `Q ${garmentWaistLeft} ${waistY} ${garmentHipLeft} ${hipY} `;
    path += `L ${garmentHemLeft} ${hemY} `;
    
    // Bottom hem
    path += `L ${garmentHemRight} ${hemY} `;
    
    // Right side
    path += `L ${garmentHipRight} ${hipY} `;
    path += `Q ${garmentWaistRight} ${waistY} ${chestRight - 3} ${chestY} `;
    path += `L ${shoulderRight - 5} ${shoulderY + 10} `;
    
    // Close at neckline
    path += `Z`;
    
    return path;
  };

  // Generate neckline path
  const generateNeckline = () => {
    if (!bodyData) return '';
    
    const centerX = 200;
    const neckY = bodyData.shoulderY + 10;
    
    switch(neckline) {
      case 'V-Neck':
      case 'Deep V':
        return `M ${centerX - 30} ${neckY} L ${centerX} ${neckY + 40} L ${centerX + 30} ${neckY}`;
      case 'Round':
        return `M ${centerX - 30} ${neckY} Q ${centerX} ${neckY + 20} ${centerX + 30} ${neckY}`;
      case 'Square':
        return `M ${centerX - 30} ${neckY} L ${centerX - 30} ${neckY + 20} L ${centerX + 30} ${neckY + 20} L ${centerX + 30} ${neckY}`;
      case 'Boat':
        return `M ${centerX - 40} ${neckY + 10} L ${centerX + 40} ${neckY + 10}`;
      case 'Sweetheart':
        return `M ${centerX - 35} ${neckY} Q ${centerX - 20} ${neckY + 25} ${centerX} ${neckY + 15} Q ${centerX + 20} ${neckY + 25} ${centerX + 35} ${neckY}`;
      case 'Halter':
        return `M ${centerX - 25} ${neckY + 20} L ${centerX} ${neckY - 10} L ${centerX + 25} ${neckY + 20}`;
      default:
        return `M ${centerX - 30} ${neckY} Q ${centerX} ${neckY + 15} ${centerX + 30} ${neckY}`;
    }
  };

  // Generate sleeve paths
  const generateSleeves = () => {
    if (!bodyProportions || !bodyData) return null;
    
    const centerX = 200;
    const shoulderY = bodyData.shoulderY;
    const shoulderLeft = bodyData.shoulderLeft;
    const shoulderRight = bodyData.shoulderRight;
    
    let sleeves = [];
    
    if (sleeve === 'Sleeveless') {
      return null; // No sleeves
    }
    
    let sleeveLength = 0;
    let sleeveWidth = 25;
    
    if (sleeve === 'Short Sleeve' || sleeve === 'Cap Sleeve') {
      sleeveLength = 50;
      sleeveWidth = 30;
    } else if (sleeve === '3/4 Sleeve') {
      sleeveLength = 120;
      sleeveWidth = 22;
    } else if (sleeve === 'Full Sleeve' || sleeve === 'Long Sleeve') {
      sleeveLength = 180;
      sleeveWidth = 20;
    } else if (sleeve === 'Bell Sleeve') {
      sleeveLength = 140;
      sleeveWidth = 40;
    }
    
    // Left sleeve
    sleeves.push(
      <path
        key="left-sleeve"
        d={`M ${shoulderLeft} ${shoulderY + 10} 
            L ${shoulderLeft - 15} ${shoulderY + sleeveLength * 0.3}
            L ${shoulderLeft - sleeveWidth} ${shoulderY + sleeveLength}
            L ${shoulderLeft - sleeveWidth + 15} ${shoulderY + sleeveLength}
            L ${shoulderLeft - 5} ${shoulderY + sleeveLength * 0.3}
            Z`}
        className="garment-sleeve"
      />
    );
    
    // Right sleeve
    sleeves.push(
      <path
        key="right-sleeve"
        d={`M ${shoulderRight} ${shoulderY + 10} 
            L ${shoulderRight + 15} ${shoulderY + sleeveLength * 0.3}
            L ${shoulderRight + sleeveWidth} ${shoulderY + sleeveLength}
            L ${shoulderRight + sleeveWidth - 15} ${shoulderY + sleeveLength}
            L ${shoulderRight + 5} ${shoulderY + sleeveLength * 0.3}
            Z`}
        className="garment-sleeve"
      />
    );
    
    return sleeves;
  };

  // Get fabric pattern/texture
  const getFabricPattern = () => {
    if (!selectedFabric) return null;
    
    const fabricName = selectedFabric.name?.toLowerCase() || '';
    
    if (fabricName.includes('silk')) {
      return 'url(#silk-pattern)';
    } else if (fabricName.includes('cotton')) {
      return 'url(#cotton-pattern)';
    } else if (fabricName.includes('velvet')) {
      return 'url(#velvet-pattern)';
    }
    
    return null;
  };

  // Get fabric color
  const getFabricColor = () => {
    if (selectedFabric?.color) {
      return selectedFabric.color;
    }
    return '#e8d5c4'; // Default beige
  };

  return (
    <div className="dynamic-garment-preview">
      <svg 
        viewBox="0 0 400 500" 
        className="garment-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Define patterns for different fabrics */}
        <defs>
          <pattern id="silk-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill={getFabricColor()} opacity="0.9"/>
            <path d="M0 10 Q 5 8, 10 10 T 20 10" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3"/>
          </pattern>
          
          <pattern id="cotton-pattern" patternUnits="userSpaceOnUse" width="15" height="15">
            <rect width="15" height="15" fill={getFabricColor()}/>
            <circle cx="7.5" cy="7.5" r="1" fill="white" opacity="0.2"/>
          </pattern>
          
          <pattern id="velvet-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill={getFabricColor()}/>
            <rect width="10" height="10" fill="black" opacity="0.1"/>
          </pattern>
          
          {/* Skin tone gradient */}
          <linearGradient id="skin-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f4d4b8" />
            <stop offset="50%" stopColor="#f7dfc8" />
            <stop offset="100%" stopColor="#f4d4b8" />
          </linearGradient>
          
          {/* Garment gradient for depth */}
          <linearGradient id="garment-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </linearGradient>
          
          {/* Embroidery pattern */}
          {hasEmbroidery && (
            <pattern id="embroidery-pattern" patternUnits="userSpaceOnUse" width="30" height="30">
              <circle cx="15" cy="15" r="3" fill="gold" opacity="0.6"/>
              <path d="M 10 15 Q 15 10, 20 15 Q 15 20, 10 15" fill="none" stroke="gold" strokeWidth="1" opacity="0.5"/>
            </pattern>
          )}
        </defs>
        
        {/* Realistic Body Mannequin */}
        {bodyData && (
          <g className="body-mannequin">
            {/* Head */}
            <ellipse 
              cx={bodyData.headCenterX} 
              cy={bodyData.headCenterY} 
              rx="28" 
              ry="35" 
              fill="url(#skin-gradient)"
              stroke="#d4a574"
              strokeWidth="1.5"
            />
            
            {/* Face features */}
            <g className="face-features" opacity="0.6">
              {/* Eyes */}
              <circle cx={bodyData.headCenterX - 10} cy={bodyData.headCenterY - 5} r="2" fill="#5a4a3a"/>
              <circle cx={bodyData.headCenterX + 10} cy={bodyData.headCenterY - 5} r="2" fill="#5a4a3a"/>
              {/* Nose */}
              <line x1={bodyData.headCenterX} y1={bodyData.headCenterY} x2={bodyData.headCenterX} y2={bodyData.headCenterY + 8} stroke="#d4a574" strokeWidth="1.5"/>
              {/* Mouth */}
              <path d={`M ${bodyData.headCenterX - 8} ${bodyData.headCenterY + 15} Q ${bodyData.headCenterX} ${bodyData.headCenterY + 18} ${bodyData.headCenterX + 8} ${bodyData.headCenterY + 15}`} stroke="#d4a574" strokeWidth="1.5" fill="none"/>
            </g>
            
            {/* Hair */}
            <ellipse 
              cx={bodyData.headCenterX} 
              cy={bodyData.headCenterY - 15} 
              rx="30" 
              ry="25" 
              fill="#3a2a1a"
              opacity="0.8"
            />
            
            {/* Neck */}
            <rect
              x={bodyData.headCenterX - 15}
              y={bodyData.headCenterY + 25}
              width="30"
              height={bodyData.neckY - (bodyData.headCenterY + 25)}
              fill="url(#skin-gradient)"
              stroke="#d4a574"
              strokeWidth="1"
            />
            
            {/* Body silhouette */}
            <path
              d={bodyData.bodyPath}
              fill="url(#skin-gradient)"
              stroke="#d4a574"
              strokeWidth="2"
              opacity="0.95"
            />
            
            {/* Arms */}
            <g className="arms">
              {/* Left arm */}
              <path
                d={`M ${bodyData.shoulderLeft} ${bodyData.shoulderY + 10}
                    L ${bodyData.shoulderLeft - 20} ${bodyData.chestY}
                    L ${bodyData.shoulderLeft - 25} ${bodyData.waistY}
                    L ${bodyData.shoulderLeft - 22} ${bodyData.hipY}
                    L ${bodyData.shoulderLeft - 18} ${bodyData.hipY}
                    L ${bodyData.shoulderLeft - 20} ${bodyData.waistY}
                    L ${bodyData.shoulderLeft - 15} ${bodyData.chestY}
                    Z`}
                fill="url(#skin-gradient)"
                stroke="#d4a574"
                strokeWidth="1.5"
                opacity="0.9"
              />
              
              {/* Right arm */}
              <path
                d={`M ${bodyData.shoulderRight} ${bodyData.shoulderY + 10}
                    L ${bodyData.shoulderRight + 20} ${bodyData.chestY}
                    L ${bodyData.shoulderRight + 25} ${bodyData.waistY}
                    L ${bodyData.shoulderRight + 22} ${bodyData.hipY}
                    L ${bodyData.shoulderRight + 18} ${bodyData.hipY}
                    L ${bodyData.shoulderRight + 20} ${bodyData.waistY}
                    L ${bodyData.shoulderRight + 15} ${bodyData.chestY}
                    Z`}
                fill="url(#skin-gradient)"
                stroke="#d4a574"
                strokeWidth="1.5"
                opacity="0.9"
              />
            </g>
            
            {/* Measurement guide lines */}
            <g className="measurement-guides" opacity="0.4">
              {/* Chest line */}
              <line x1={bodyData.chestLeft - 30} y1={bodyData.chestY} x2={bodyData.chestRight + 30} y2={bodyData.chestY} stroke="#e91e63" strokeWidth="1" strokeDasharray="3,3"/>
              <text x={bodyData.chestRight + 35} y={bodyData.chestY + 5} fontSize="10" fill="#e91e63" fontWeight="600">
                {bodyProportions.chest}"
              </text>
              
              {/* Waist line */}
              <line x1={bodyData.waistLeft - 30} y1={bodyData.waistY} x2={bodyData.waistRight + 30} y2={bodyData.waistY} stroke="#e91e63" strokeWidth="1" strokeDasharray="3,3"/>
              <text x={bodyData.waistRight + 35} y={bodyData.waistY + 5} fontSize="10" fill="#e91e63" fontWeight="600">
                {bodyProportions.waist}"
              </text>
              
              {/* Hip line */}
              <line x1={bodyData.hipLeft - 30} y1={bodyData.hipY} x2={bodyData.hipRight + 30} y2={bodyData.hipY} stroke="#e91e63" strokeWidth="1" strokeDasharray="3,3"/>
              <text x={bodyData.hipRight + 35} y={bodyData.hipY + 5} fontSize="10" fill="#e91e63" fontWeight="600">
                {bodyProportions.hips}"
              </text>
            </g>
          </g>
        )}
        
        {/* Main garment body */}
        <path
          d={generateGarmentPath()}
          fill={getFabricPattern() || getFabricColor()}
          stroke="#8b7355"
          strokeWidth="2"
          className="garment-body"
          opacity="0.92"
        />
        
        {/* Gradient overlay for 3D effect */}
        <path
          d={generateGarmentPath()}
          fill="url(#garment-gradient)"
          opacity="0.3"
        />
        
        {/* Sleeves */}
        {generateSleeves()}
        
        {/* Neckline */}
        <path
          d={generateNeckline()}
          stroke="#8b7355"
          strokeWidth="2.5"
          fill="none"
          className="garment-neckline"
        />
        
        {/* Lining indicator */}
        {hasLining && (
          <path
            d={generateGarmentPath()}
            fill="none"
            stroke="#d4af37"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.5"
          />
        )}
        
        {/* Embroidery overlay */}
        {hasEmbroidery && embroideryDetails && bodyData && (
          <g className="embroidery-layer">
            {embroideryDetails.placement === 'Neckline' && (
              <path
                d={generateNeckline()}
                stroke="url(#embroidery-pattern)"
                strokeWidth="8"
                fill="none"
                opacity="0.7"
              />
            )}
            {embroideryDetails.placement === 'Border' && (
              <path
                d={generateGarmentPath()}
                fill="none"
                stroke="url(#embroidery-pattern)"
                strokeWidth="12"
                opacity="0.6"
              />
            )}
            {embroideryDetails.placement === 'Sleeves' && generateSleeves() && (
              <g>
                <circle cx={bodyData.shoulderLeft - 15} cy={bodyData.shoulderY + 40} r="8" fill="url(#embroidery-pattern)" opacity="0.7"/>
                <circle cx={bodyData.shoulderRight + 15} cy={bodyData.shoulderY + 40} r="8" fill="url(#embroidery-pattern)" opacity="0.7"/>
              </g>
            )}
          </g>
        )}
      </svg>
      
      {/* Info overlay */}
      <div className="preview-info-overlay">
        <div className="info-badge">
          <span className="badge-label">Body Type:</span>
          <span className="badge-value">{bodyShape || 'Calculating...'}</span>
        </div>
        <div className="info-badge">
          <span className="badge-label">Silhouette:</span>
          <span className="badge-value">{silhouette}</span>
        </div>
        {selectedFabric && (
          <div className="info-badge">
            <span className="badge-label">Fabric:</span>
            <span className="badge-value">{selectedFabric.name}</span>
          </div>
        )}
        {bodyProportions && (
          <div className="info-badge">
            <span className="badge-label">Measurements:</span>
            <span className="badge-value">
              {bodyProportions.chest}-{bodyProportions.waist}-{bodyProportions.hips}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicGarmentPreview;
