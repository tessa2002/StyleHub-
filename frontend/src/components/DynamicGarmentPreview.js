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
  const centerX = 200; // Define globally for the component
  
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
    
    // Vertical positions (scaled by height)
    const headTop = 15;
    const neckY = 55 * heightScale;
    const shoulderY = 75 * heightScale;
    const chestY = 135 * heightScale;
    const waistY = 195 * heightScale;
    const hipY = 255 * heightScale;
    const thighY = 315 * heightScale;
    const kneeY = 375 * heightScale;
    const ankleY = 435 * heightScale;
    const footY = 460 * heightScale;
    
    // Calculate widths at each body point (in pixels, scaled appropriately)
    const scale = 0.75; // Increased scale for better detail
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
    const kneeLeft = centerX - (hipsWidth * scale * 0.45);
    const kneeRight = centerX + (hipsWidth * scale * 0.45);
    const ankleLeft = centerX - (hipsWidth * scale * 0.25);
    const ankleRight = centerX + (hipsWidth * scale * 0.25);
    
    // Build body path with professional mannequin (dress form) curves
    let bodyPath = `M ${centerX} ${neckY} `; // Start at center neck
    
    // Left side - Sculpted dress form style
    bodyPath += `C ${centerX - 15} ${neckY} ${centerX - 20} ${neckY + 5} ${shoulderLeft} ${shoulderY} `; // Neck to shoulder
    bodyPath += `C ${shoulderLeft - 8} ${shoulderY + 15} ${chestLeft - 15} ${chestY - 25} ${chestLeft} ${chestY} `; // Shoulder to bust
    bodyPath += `C ${chestLeft + 10} ${chestY + 35} ${waistLeft} ${waistY - 35} ${waistLeft} ${waistY} `; // Bust to waist
    bodyPath += `C ${waistLeft} ${waistY + 35} ${hipLeft} ${hipY - 35} ${hipLeft} ${hipY} `; // Waist to hip
    
    // Crotch area
    bodyPath += `C ${hipLeft} ${hipY + 15} ${centerX - 10} ${hipY + 15} ${centerX} ${hipY + 20} `;
    
    // Right side (mirror)
    bodyPath += `C ${centerX + 10} ${hipY + 15} ${hipRight} ${hipY + 15} ${hipRight} ${hipY} `;
    bodyPath += `C ${hipRight} ${hipY - 35} ${waistRight} ${waistY + 35} ${waistRight} ${waistY} `;
    bodyPath += `C ${waistRight} ${waistY - 35} ${chestRight - 10} ${chestY + 35} ${chestRight} ${chestY} `;
    bodyPath += `C ${chestRight + 15} ${chestY - 25} ${shoulderRight + 8} ${shoulderY + 15} ${shoulderRight} ${shoulderY} `;
    bodyPath += `C ${shoulderRight + 20} ${neckY + 5} ${centerX + 15} ${neckY} ${centerX} ${neckY} `;
    bodyPath += `Z`;

    // Separate paths for legs with realistic definition (knees, calves, ankles, feet)
    const leftLegPath = `
      M ${hipLeft} ${hipY}
      C ${hipLeft} ${hipY + 30} ${thighLeft} ${thighY - 20} ${thighLeft} ${thighY}
      C ${thighLeft} ${thighY + 30} ${kneeLeft - 8} ${kneeY - 15} ${kneeLeft} ${kneeY}
      C ${kneeLeft + 8} ${kneeY + 15} ${kneeLeft - 10} ${ankleY - 30} ${ankleLeft} ${ankleY}
      C ${ankleLeft} ${ankleY + 10} ${ankleLeft - 18} ${footY} ${ankleLeft - 8} ${footY}
      L ${ankleLeft + 12} ${footY}
      C ${ankleLeft + 22} ${footY} ${ankleLeft + 15} ${ankleY + 5} ${ankleLeft + 8} ${ankleY}
      L ${centerX} ${hipY + 20}
      Z
    `;

    const rightLegPath = `
      M ${hipRight} ${hipY}
      C ${hipRight} ${hipY + 30} ${thighRight} ${thighY - 20} ${thighRight} ${thighY}
      C ${thighRight} ${thighY + 30} ${kneeRight + 8} ${kneeY - 15} ${kneeRight} ${kneeY}
      C ${kneeRight - 8} ${kneeY + 15} ${kneeRight + 10} ${ankleY - 30} ${ankleRight} ${ankleY}
      C ${ankleRight} ${ankleY + 10} ${ankleRight + 18} ${footY} ${ankleRight + 8} ${footY}
      L ${ankleRight - 12} ${footY}
      C ${ankleRight - 22} ${footY} ${ankleRight - 15} ${ankleY + 5} ${ankleRight - 8} ${ankleY}
      L ${centerX} ${hipY + 20}
      Z
    `;
    
    return {
      bodyPath,
      leftLegPath,
      rightLegPath,
      headCenterX: centerX,
      headCenterY: headTop + 25,
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
      hipRight,
      thighLeft,
      thighRight,
      kneeLeft,
      kneeRight,
      ankleLeft,
      ankleRight,
      kneeY,
      thighY,
      ankleY,
      footY
    };
  };

  const bodyData = generateBodySilhouette();
  // Generate SVG path for garment based on body type and customizations
  const generateGarmentPath = () => {
    if (!bodyProportions || !bodyData) return '';
    
    const { shoulderLeft, shoulderRight, chestLeft, chestRight, waistLeft, waistRight, hipLeft, hipRight, shoulderY, chestY, waistY, hipY, ankleY } = bodyData;
    
    // Adjust garment length based on type
    let hemY = hipY + 80;
    let isSaree = garmentType === 'Saree';
    
    if (garmentType === 'Short Kurthi' || garmentType === 'Crop Top & Skirt') {
      hemY = hipY + 40;
    } else if (garmentType === 'Kurthi') {
      hemY = hipY + 110;
    } else if (garmentType === 'Gown' || garmentType === 'Anarkali' || garmentType === 'Lehenga') {
      hemY = ankleY + 10;
    }
    
    // Calculate garment widths based on silhouette
    let garmentWaistLeft = waistLeft;
    let garmentWaistRight = waistRight;
    let garmentHipLeft = hipLeft;
    let garmentHipRight = hipRight;
    let garmentHemLeft = hipLeft;
    let garmentHemRight = hipRight;
    
    if (silhouette === 'A-Line' || garmentType === 'Lehenga') {
      garmentWaistLeft = waistLeft - 2;
      garmentWaistRight = waistRight + 2;
      garmentHemLeft = centerX - (bodyProportions.hipsWidth * 1.6);
      garmentHemRight = centerX + (bodyProportions.hipsWidth * 1.6);
    } else if (silhouette === 'Mermaid') {
      garmentWaistLeft = waistLeft + 2;
      garmentWaistRight = waistRight - 2;
      garmentHipLeft = hipLeft + 3;
      garmentHipRight = hipRight - 3;
      garmentHemLeft = centerX - (bodyProportions.hipsWidth * 1.8);
      garmentHemRight = centerX + (bodyProportions.hipsWidth * 1.8);
    } else if (silhouette === 'Empire') {
      garmentWaistLeft = chestLeft - 3;
      garmentWaistRight = chestRight + 3;
      garmentHemLeft = centerX - (bodyProportions.hipsWidth * 1.4);
      garmentHemRight = centerX + (bodyProportions.hipsWidth * 1.4);
    } else if (silhouette === 'Sheath') {
      garmentWaistLeft = waistLeft + 1;
      garmentWaistRight = waistRight - 1;
      garmentHipLeft = hipLeft + 1;
      garmentHipRight = hipRight - 1;
      garmentHemLeft = hipLeft + 3;
      garmentHemRight = hipRight - 3;
    }

    // Special path for Saree (Drape effect)
    if (isSaree) {
      // Bottom skirt part of Saree
      let sareePath = `M ${waistLeft} ${waistY} 
                       L ${hipLeft - 10} ${hipY} 
                       L ${centerX - (bodyProportions.hipsWidth * 1.1)} ${ankleY + 15}
                       Q ${centerX} ${ankleY + 25} ${centerX + (bodyProportions.hipsWidth * 1.1)} ${ankleY + 15}
                       L ${hipRight + 10} ${hipY}
                       L ${waistRight} ${waistY}
                       Z `;
      
      // Pallu (Diagonal drape)
      sareePath += `M ${shoulderLeft + 5} ${shoulderY + 10}
                    L ${centerX + 20} ${waistY}
                    L ${waistRight} ${waistY}
                    L ${shoulderRight - 5} ${shoulderY + 10}
                    Z`;
      return sareePath;
    }
    
    // Build garment path with smooth curves for other types
    let path = `M ${shoulderLeft + 5} ${shoulderY + 10} `; // Start left shoulder
    
    // Left side
    path += `L ${chestLeft + 3} ${chestY} `;
    path += `C ${chestLeft + 3} ${chestY + 20} ${garmentWaistLeft} ${waistY - 20} ${garmentWaistLeft} ${waistY} `;
    path += `C ${garmentWaistLeft} ${waistY + 20} ${garmentHipLeft} ${hipY - 20} ${garmentHipLeft} ${hipY} `;
    path += `L ${garmentHemLeft} ${hemY} `;
    
    // Bottom hem (slightly curved)
    path += `Q ${centerX} ${hemY + 15} ${garmentHemRight} ${hemY} `;
    
    // Right side
    path += `L ${garmentHipRight} ${hipY} `;
    path += `C ${garmentHipRight} ${hipY - 20} ${garmentWaistRight} ${waistY + 20} ${garmentWaistRight} ${waistY} `;
    path += `C ${garmentWaistRight} ${waistY - 20} ${chestRight - 3} ${chestY + 20} ${chestRight - 3} ${chestY} `;
    path += `L ${shoulderRight - 5} ${shoulderY + 10} `;
    
    // Close at neckline
    path += `Z`;
    
    return path;
  };

  // Generate neckline path
  const generateNeckline = () => {
    if (!bodyData) return '';
    
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
          <pattern id="silk-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
            <rect width="40" height="40" fill={getFabricColor()}/>
            <path d="M0 20 Q 10 15, 20 20 T 40 20" stroke="white" strokeWidth="0.5" fill="none" opacity="0.15">
              <animate attributeName="d" dur="5s" repeatCount="indefinite"
                values="M0 20 Q 10 15, 20 20 T 40 20; M0 20 Q 10 25, 20 20 T 40 20; M0 20 Q 10 15, 20 20 T 40 20" />
            </path>
          </pattern>
          
          <pattern id="cotton-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill={getFabricColor()}/>
            <path d="M0 0 L 20 20 M 20 0 L 0 20" stroke="black" strokeWidth="0.2" opacity="0.05"/>
          </pattern>
          
          <pattern id="velvet-pattern" patternUnits="userSpaceOnUse" width="30" height="30">
            <rect width="30" height="30" fill={getFabricColor()}/>
            <rect width="30" height="30" fill="url(#velvet-grad)" opacity="0.3"/>
          </pattern>

          <linearGradient id="velvet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </linearGradient>
          
          {/* Skin tone gradient - Professional Mannequin Style */}
          <linearGradient id="skin-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          
          {/* Garment gradient for depth */}
          <radialGradient id="garment-shading" cx="50%" cy="40%" r="60%" fx="50%" fy="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </radialGradient>
          
          {/* Advanced Skin Shading */}
          <radialGradient id="skin-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(148,163,184,0.15)" />
          </radialGradient>

          <linearGradient id="leg-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
            <stop offset="50%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
          </linearGradient>

          {/* Garment texture and depth */}
          <pattern id="premium-weave" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M0 0 L4 4 M4 0 L0 4" stroke="black" strokeWidth="0.1" opacity="0.1" />
          </pattern>
          
          <radialGradient id="garment-highlight" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
          </radialGradient>
        </defs>

        {/* Studio Background */}
        <rect width="400" height="500" fill="url(#studio-grad)" />
        <defs>
          <radialGradient id="studio-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
        </defs>

        {/* Realistic Body Mannequin */}
        {bodyData && (
          <g className="body-mannequin">
            {/* Main Body */}
            <path d={bodyData.bodyPath} fill="url(#skin-gradient)" stroke="#cbd5e1" strokeWidth="0.5" />
            
            {/* Legs */}
            <path d={bodyData.leftLegPath} fill="url(#skin-gradient)" stroke="#cbd5e1" strokeWidth="0.5" />
            <path d={bodyData.rightLegPath} fill="url(#skin-gradient)" stroke="#cbd5e1" strokeWidth="0.5" />

            {/* Skin Shading Layer */}
            <path d={bodyData.bodyPath} fill="url(#skin-shadow)" opacity="0.4" />
            <path d={bodyData.leftLegPath} fill="url(#skin-shadow)" opacity="0.2" />
            <path d={bodyData.rightLegPath} fill="url(#skin-shadow)" opacity="0.2" />
            
            {/* Joint Markers (Professional Mannequin Look) */}
            <g fill="#cbd5e1" opacity="0.5">
              {/* Elbows */}
              <circle cx={bodyData.shoulderLeft - 22} cy={bodyData.waistY} r="4" />
              <circle cx={bodyData.shoulderRight + 22} cy={bodyData.waistY} r="4" />
              {/* Knees */}
              <circle cx={bodyData.kneeLeft} cy={bodyData.kneeY} r="5" />
              <circle cx={bodyData.kneeRight} cy={bodyData.kneeY} r="5" />
            </g>

            {/* Anatomical Details (Subtle) */}
            <g opacity="0.1" stroke="#94a3b8" fill="none" strokeWidth="1" strokeLinecap="round">
              {/* Collarbones */}
              <path d={`M ${centerX - 40} ${bodyData.neckY + 10} Q ${centerX - 20} ${bodyData.neckY + 15} ${centerX - 10} ${bodyData.neckY + 12}`} />
              <path d={`M ${centerX + 40} ${bodyData.neckY + 10} Q ${centerX + 20} ${bodyData.neckY + 15} ${centerX + 10} ${bodyData.neckY + 12}`} />
              
              {/* Abs/Torso definition */}
              <path d={`M ${centerX} ${bodyData.chestY + 20} L ${centerX} ${bodyData.waistY - 10}`} strokeWidth="0.5" />
              <path d={`M ${bodyData.waistLeft + 15} ${bodyData.waistY} Q ${centerX} ${bodyData.waistY + 5} ${bodyData.waistRight - 15} ${bodyData.waistY}`} opacity="0.5" />
            </g>

            {/* Head and Hair */}
            <g className="head-group">
              <ellipse cx={bodyData.headCenterX} cy={bodyData.headCenterY} rx="24" ry="30" fill="url(#skin-gradient)" stroke="#cbd5e1" strokeWidth="0.5" />
            </g>
            
            {/* Face features - more subtle */}
            <g className="face-features" opacity="0.3">
              <path d={`M ${bodyData.headCenterX - 12} ${bodyData.headCenterY - 2} Q ${bodyData.headCenterX - 8} ${bodyData.headCenterY - 5} ${bodyData.headCenterX - 4} ${bodyData.headCenterY - 2}`} stroke="#5a4a3a" fill="none" />
              <path d={`M ${bodyData.headCenterX + 4} ${bodyData.headCenterY - 2} Q ${bodyData.headCenterX + 8} ${bodyData.headCenterY - 5} ${bodyData.headCenterX + 12} ${bodyData.headCenterY - 2}`} stroke="#5a4a3a" fill="none" />
            </g>
            
        {/* Measurement guide lines */}
            <g className="measurement-guides" opacity="0.6">
              {/* Chest line */}
              <line x1={bodyData.chestLeft - 40} y1={bodyData.chestY} x2={bodyData.chestRight + 40} y2={bodyData.chestY} stroke="#fcd34d" strokeWidth="4" />
              <line x1={bodyData.chestLeft - 40} y1={bodyData.chestY} x2={bodyData.chestRight + 40} y2={bodyData.chestY} stroke="#000" strokeWidth="0.5" strokeDasharray="2,2" />
              <text x={bodyData.chestRight + 45} y={bodyData.chestY + 4} fontSize="10" fill="#444" fontWeight="800">
                {bodyProportions.chest}"
              </text>
              
              {/* Waist line */}
              <line x1={bodyData.waistLeft - 40} y1={bodyData.waistY} x2={bodyData.waistRight + 40} y2={bodyData.waistY} stroke="#fcd34d" strokeWidth="4" />
              <line x1={bodyData.waistLeft - 40} y1={bodyData.waistY} x2={bodyData.waistRight + 40} y2={bodyData.waistY} stroke="#000" strokeWidth="0.5" strokeDasharray="2,2" />
              <text x={bodyData.waistRight + 45} y={bodyData.waistY + 4} fontSize="10" fill="#444" fontWeight="800">
                {bodyProportions.waist}"
              </text>
              
              {/* Hip line */}
              <line x1={bodyData.hipLeft - 40} y1={bodyData.hipY} x2={bodyData.hipRight + 40} y2={bodyData.hipY} stroke="#fcd34d" strokeWidth="4" />
              <line x1={bodyData.hipLeft - 40} y1={bodyData.hipY} x2={bodyData.hipRight + 40} y2={bodyData.hipY} stroke="#000" strokeWidth="0.5" strokeDasharray="2,2" />
              <text x={bodyData.hipRight + 45} y={bodyData.hipY + 4} fontSize="10" fill="#444" fontWeight="800">
                {bodyProportions.hips}"
              </text>
            </g>
          </g>
        )}
        
        {/* Main garment body */}
        <g className="garment-group">
          <path
            d={generateGarmentPath()}
            fill={getFabricPattern() || getFabricColor()}
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="0.5"
            className="garment-body"
          />
          
          {/* Fabric Weave Texture */}
          <path d={generateGarmentPath()} fill="url(#premium-weave)" opacity="0.2" pointerEvents="none" />
          
          {/* Shading overlay */}
          <path d={generateGarmentPath()} fill="url(#garment-shading)" opacity="0.4" pointerEvents="none" />
          
          {/* Dynamic Highlights */}
          <path d={generateGarmentPath()} fill="url(#garment-highlight)" opacity="0.3" pointerEvents="none" />

          {/* Fabric Folds (Visual depth) */}
          <g opacity="0.15" stroke="black" fill="none" strokeWidth="1">
            <path d={`M ${bodyData.waistLeft + 5} ${bodyData.waistY - 10} Q ${centerX} ${bodyData.waistY - 5} ${bodyData.waistRight - 5} ${bodyData.waistY - 10}`} />
            <path d={`M ${bodyData.waistLeft + 10} ${bodyData.waistY + 5} Q ${centerX} ${bodyData.waistY + 10} ${bodyData.waistRight - 10} ${bodyData.waistY + 5}`} />
            {/* Vertical drape folds */}
            <path d={`M ${centerX - 20} ${bodyData.waistY + 10} Q ${centerX - 25} ${bodyData.hipY} ${centerX - 30} ${bodyData.hipY + 80}`} />
            <path d={`M ${centerX + 20} ${bodyData.waistY + 10} Q ${centerX + 25} ${bodyData.hipY} ${centerX + 30} ${bodyData.hipY + 80}`} />
            {/* Hemline folds */}
            <path d={`M ${bodyData.hipLeft + 10} ${bodyData.hipY + 80} Q ${centerX} ${bodyData.hipY + 95} ${bodyData.hipRight - 10} ${bodyData.hipY + 80}`} />
          </g>
        </g>

        {/* Realistic Arms with Hands - Attached correctly to shoulders */}
        {bodyData && (
          <g className="arms-overlay">
            {/* Left arm */}
            <g className="arm-left">
              <path
                d={`M ${bodyData.shoulderLeft} ${bodyData.shoulderY}
                    C ${bodyData.shoulderLeft - 20} ${bodyData.shoulderY} ${bodyData.shoulderLeft - 35} ${bodyData.shoulderY + 20} ${bodyData.shoulderLeft - 40} ${bodyData.chestY}
                    C ${bodyData.shoulderLeft - 45} ${bodyData.waistY} ${bodyData.shoulderLeft - 45} ${bodyData.hipY - 20} ${bodyData.shoulderLeft - 42} ${bodyData.hipY}
                    L ${bodyData.shoulderLeft - 25} ${bodyData.hipY}
                    C ${bodyData.shoulderLeft - 28} ${bodyData.hipY - 20} ${bodyData.shoulderLeft - 28} ${bodyData.waistY} ${bodyData.shoulderLeft - 25} ${bodyData.chestY}
                    C ${bodyData.shoulderLeft - 22} ${bodyData.shoulderY + 20} ${bodyData.shoulderLeft - 10} ${bodyData.shoulderY + 10} ${bodyData.shoulderLeft} ${bodyData.shoulderY + 15}
                    Z`}
                fill="url(#skin-gradient)"
                stroke="#cbd5e1"
                strokeWidth="0.5"
              />
              {/* Left Hand - Attached to wrist */}
              <g className="hand-left" transform={`translate(${bodyData.shoulderLeft - 33.5}, ${bodyData.hipY})`}>
                <path 
                  d="M -4 0 C -9 4 -12 15 -7 28 C -5 34 5 34 7 28 C 11 15 9 4 4 0 Z"
                  fill="url(#skin-gradient)"
                  stroke="#cbd5e1"
                  strokeWidth="0.4"
                />
                <path d="M 4 2 C 10 5 12 12 9 18 C 7 21 5 18 4 12" fill="none" stroke="#cbd5e1" strokeWidth="0.4" />
              </g>
            </g>
            
            {/* Right arm */}
            <g className="arm-right">
              <path
                d={`M ${bodyData.shoulderRight} ${bodyData.shoulderY}
                    C ${bodyData.shoulderRight + 20} ${bodyData.shoulderY} ${bodyData.shoulderRight + 35} ${bodyData.shoulderY + 20} ${bodyData.shoulderRight + 40} ${bodyData.chestY}
                    C ${bodyData.shoulderRight + 45} ${bodyData.waistY} ${bodyData.shoulderRight + 45} ${bodyData.hipY - 20} ${bodyData.shoulderRight + 42} ${bodyData.hipY}
                    L ${bodyData.shoulderRight + 25} ${bodyData.hipY}
                    C ${bodyData.shoulderRight + 28} ${bodyData.hipY - 20} ${bodyData.shoulderRight + 28} ${bodyData.waistY} ${bodyData.shoulderRight + 25} ${bodyData.chestY}
                    C ${bodyData.shoulderRight + 22} ${bodyData.shoulderY + 20} ${bodyData.shoulderRight + 10} ${bodyData.shoulderY + 10} ${bodyData.shoulderRight} ${bodyData.shoulderY + 15}
                    Z`}
                fill="url(#skin-gradient)"
                stroke="#cbd5e1"
                strokeWidth="0.5"
              />
              {/* Right Hand - Attached to wrist */}
              <g className="hand-right" transform={`translate(${bodyData.shoulderRight + 33.5}, ${bodyData.hipY})`}>
                <path 
                  d="M 4 0 C 9 4 12 15 7 28 C 5 34 -5 34 -7 28 C -11 15 -9 4 -4 0 Z"
                  fill="url(#skin-gradient)"
                  stroke="#cbd5e1"
                  strokeWidth="0.4"
                />
                <path d="M -4 2 C -10 5 -12 12 -9 18 C -7 21 -5 18 -4 12" fill="none" stroke="#cbd5e1" strokeWidth="0.4" />
              </g>
            </g>
          </g>
        )}
        
        {/* Sleeves */}
        <g opacity="0.95">
          {generateSleeves()}
        </g>
        
        {/* Neckline */}
        <path
          d={generateNeckline()}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1.5"
          fill="none"
          className="garment-neckline"
        />
        
        {/* Lining indicator */}
        {hasLining && (
          <path
            d={generateGarmentPath()}
            fill="none"
            stroke="#d4af37"
            strokeWidth="0.5"
            strokeDasharray="3,3"
            opacity="0.4"
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
