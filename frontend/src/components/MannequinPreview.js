import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './MannequinPreview.css';

/**
 * Mannequin Model Loader
 * Loads a realistic 3D mannequin model from GLB/GLTF file
 */
function MannequinModel({ measurements, modelUrl, onError }) {
  const meshRef = useRef();
  
  // Calculate scale based on measurements (must be before any conditional returns)
  const scale = React.useMemo(() => {
    if (!measurements) return [1, 1, 1];
    
    const chest = parseFloat(measurements?.Chest || measurements?.chest || 36);
    const height = parseFloat(measurements?.Height || measurements?.height || 65);
    
    // Scale factors (adjust based on your model's default size)
    const widthScale = chest / 36; // Normalize to average
    const heightScale = height / 65;
    
    return [widthScale, heightScale, widthScale];
  }, [measurements]);
  
  // Try to load the 3D model with error handling
  let scene = null;
  let loadError = false;
  
  try {
    const result = useGLTF(modelUrl || '/models/female-mannequin.glb', true);
    scene = result.scene;
  } catch (error) {
    console.log('GLB model not found, using fallback');
    loadError = true;
  }
  
  // Call onError after hooks
  React.useEffect(() => {
    if (loadError || !scene) {
      if (onError) onError();
    }
  }, [loadError, scene, onError]);
  
  if (!scene || loadError) {
    return null;
  }
  
  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={scale}
      position={[0, 0, 0]}
    />
  );
}

/**
 * Fallback Mannequin (if no model file available)
 * Creates a simple but realistic-looking mannequin
 */
function FallbackMannequin({ measurements }) {
  const meshRef = useRef();
  
  const proportions = React.useMemo(() => {
    const chest = parseFloat(measurements?.Chest || measurements?.chest || 36);
    const waist = parseFloat(measurements?.Waist || measurements?.waist || 30);
    const hips = parseFloat(measurements?.Hips || measurements?.hips || 38);
    const height = parseFloat(measurements?.Height || measurements?.height || 65);
    
    const scale = 0.025;
    
    return {
      chestRadius: (chest / 2) * scale,
      waistRadius: (waist / 2) * scale,
      hipRadius: (hips / 2) * scale,
      height: height * scale * 0.8,
    };
  }, [measurements]);
  
  // Create mannequin-like body
  const bodyGeometry = React.useMemo(() => {
    const points = [];
    const { chestRadius, waistRadius, hipRadius } = proportions;
    
    // Build smooth body profile
    points.push(new THREE.Vector2(0.15, 0)); // Feet
    points.push(new THREE.Vector2(0.18, 0.1));
    points.push(new THREE.Vector2(0.22, 0.3)); // Calves
    points.push(new THREE.Vector2(0.20, 0.5)); // Knees
    points.push(new THREE.Vector2(hipRadius * 0.85, 0.7)); // Thighs
    points.push(new THREE.Vector2(hipRadius, 1.0)); // Hips
    points.push(new THREE.Vector2(waistRadius, 1.3)); // Waist
    points.push(new THREE.Vector2(chestRadius, 1.7)); // Chest
    points.push(new THREE.Vector2(chestRadius * 0.9, 2.0)); // Shoulders
    points.push(new THREE.Vector2(0.15, 2.1)); // Neck
    points.push(new THREE.Vector2(0.12, 2.3)); // Neck top
    
    return new THREE.LatheGeometry(points, 32);
  }, [proportions]);
  
  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#f5e6d3" 
          roughness={0.7} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.10, 0.12, 0.3, 16]} />
        <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
      </mesh>
      
      {/* Arms and Hands */}
      <group position={[-proportions.chestRadius - 0.12, 1.8, 0]} rotation={[0, 0, 0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.7, 16]} />
          <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
        </mesh>
        {/* Hand - Ellipsoid for more natural shape */}
         <mesh position={[0, -0.42, 0.02]} rotation={[0.2, 0, 0]} castShadow>
           <sphereGeometry args={[0.08, 16, 16]} />
           <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
         </mesh>
         {/* Thumb nub */}
         <mesh position={[0.04, -0.38, 0.05]} castShadow>
           <sphereGeometry args={[0.03, 8, 8]} />
           <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
         </mesh>
       </group>
       
       <group position={[proportions.chestRadius + 0.12, 1.8, 0]} rotation={[0, 0, -0.2]}>
         <mesh castShadow>
           <cylinderGeometry args={[0.07, 0.06, 0.7, 16]} />
           <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
         </mesh>
         {/* Hand - Ellipsoid for more natural shape */}
         <mesh position={[0, -0.42, 0.02]} rotation={[0.2, 0, 0]} castShadow>
           <sphereGeometry args={[0.08, 16, 16]} />
           <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
         </mesh>
         {/* Thumb nub */}
         <mesh position={[-0.04, -0.38, 0.05]} castShadow>
           <sphereGeometry args={[0.03, 8, 8]} />
           <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
         </mesh>
       </group>
      
      {/* Base stand */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Garment Overlay
 */
function GarmentOverlay({ garmentType, silhouette, selectedFabric, measurements }) {
  const meshRef = useRef();
  
  const proportions = React.useMemo(() => {
    const chest = parseFloat(measurements?.Chest || measurements?.chest || 36);
    const waist = parseFloat(measurements?.Waist || measurements?.waist || 30);
    const hips = parseFloat(measurements?.Hips || measurements?.hips || 38);
    const scale = 0.025;
    
    return {
      chestRadius: (chest / 2) * scale + 0.02,
      waistRadius: (waist / 2) * scale + 0.02,
      hipRadius: (hips / 2) * scale + 0.02,
    };
  }, [measurements]);
  
  const garmentGeometry = React.useMemo(() => {
    const points = [];
    const { chestRadius, waistRadius, hipRadius } = proportions;
    
    let hemRadius = hipRadius;
    let hemHeight = 0.8;
    
    // Adjust based on silhouette
    if (silhouette === 'A-Line') {
      hemRadius = hipRadius * 1.3;
      hemHeight = 0.7;
    } else if (silhouette === 'Mermaid') {
      hemRadius = hipRadius * 1.5;
      hemHeight = 0.6;
    } else if (silhouette === 'Empire') {
      hemRadius = hipRadius * 1.2;
      hemHeight = 0.5;
    }
    
    // Adjust based on garment type
    if (garmentType === 'Short Kurthi') {
      hemHeight = 1.1;
    } else if (garmentType === 'Gown' || garmentType === 'Lehenga') {
      hemHeight = 0.1;
    }
    
    points.push(new THREE.Vector2(hemRadius, hemHeight));
    points.push(new THREE.Vector2(hipRadius * 1.02, 1.0));
    points.push(new THREE.Vector2(waistRadius * 1.02, 1.3));
    points.push(new THREE.Vector2(chestRadius * 1.02, 1.7));
    points.push(new THREE.Vector2(chestRadius * 0.95, 1.85));
    
    return new THREE.LatheGeometry(points, 32);
  }, [proportions, silhouette, garmentType]);
  
  const fabricColor = selectedFabric?.color || '#e8d5c4';
  
  return (
    <mesh ref={meshRef} geometry={garmentGeometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color={fabricColor}
        roughness={0.6}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Main Mannequin Preview Component
 */
const MannequinPreview = ({
  garmentType,
  measurements,
  bodyShape,
  silhouette,
  neckline,
  sleeve,
  selectedFabric,
  hasLining,
  hasEmbroidery,
  embroideryDetails,
  mannequinModelUrl
}) => {
  const [autoRotate, setAutoRotate] = useState(false);
  const [useFallback, setUseFallback] = useState(true); // Start with fallback
  const [modelError, setModelError] = useState(false);
  
  // Check if GLB file exists
  React.useEffect(() => {
    const checkModel = async () => {
      try {
        const response = await fetch('/models/female-mannequin.glb', { method: 'HEAD' });
        if (response.ok) {
          setUseFallback(false);
        }
      } catch (error) {
        console.log('No GLB model found, using fallback mannequin');
        setUseFallback(true);
      }
    };
    
    if (!mannequinModelUrl) {
      checkModel();
    } else {
      setUseFallback(false);
    }
  }, [mannequinModelUrl]);
  
  const handleModelError = () => {
    console.log('Error loading GLB model, switching to fallback');
    setUseFallback(true);
    setModelError(true);
  };
  
  return (
    <div className="mannequin-preview">
      <Canvas shadows camera={{ position: [0, 2, 4], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Lighting setup */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} />
          <pointLight position={[0, 3, 0]} intensity={0.3} />
          
          {/* Environment for realistic reflections */}
          <Environment preset="studio" />
          
          {/* Mannequin Model */}
          {useFallback ? (
            <FallbackMannequin measurements={measurements} />
          ) : (
            <MannequinModel 
              measurements={measurements} 
              modelUrl={mannequinModelUrl}
              onError={handleModelError}
            />
          )}
          
          {/* Garment Overlay */}
          <GarmentOverlay
            garmentType={garmentType}
            silhouette={silhouette}
            selectedFabric={selectedFabric}
            measurements={measurements}
          />
          
          {/* Ground shadow */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />
          
          {/* Camera controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
      
      {/* Controls */}
      <div className="mannequin-controls">
        <button
          className="control-btn-mannequin"
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? '⏸' : '▶'} {autoRotate ? 'Stop' : 'Rotate'}
        </button>
        <div className="control-hint-mannequin">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
      
      {/* Info badges */}
      <div className="mannequin-info">
        <div className="info-badge-mannequin realistic-badge">
          <span>🎭 Realistic Mannequin</span>
        </div>
        <div className="info-badge-mannequin">
          <span className="badge-label">Body:</span>
          <span className="badge-value">{bodyShape || 'Custom'}</span>
        </div>
        <div className="info-badge-mannequin">
          <span className="badge-label">Style:</span>
          <span className="badge-value">{silhouette}</span>
        </div>
        {selectedFabric && (
          <div className="info-badge-mannequin">
            <span className="badge-label">Fabric:</span>
            <span className="badge-value">{selectedFabric.name}</span>
          </div>
        )}
      </div>
      
      {useFallback && !modelError && (
        <div className="fallback-notice">
          Using built-in mannequin. <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://sketchfab.com/search?q=female+mannequin&type=models', '_blank'); }}>Download GLB</a> for more realism.
        </div>
      )}
      
      {modelError && (
        <div className="fallback-notice error-notice">
          GLB model not found. Using built-in mannequin.
        </div>
      )}
    </div>
  );
};

export default MannequinPreview;
