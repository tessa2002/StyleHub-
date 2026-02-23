import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import './Realistic3DPreview.css';

/**
 * 3D Body Model Component
 * Creates a parametric 3D body based on measurements
 */
function BodyModel({ measurements, bodyShape }) {
  const meshRef = useRef();
  
  // Calculate body proportions from measurements
  const proportions = useMemo(() => {
    const chest = parseFloat(measurements?.Chest || measurements?.chest || 36);
    const waist = parseFloat(measurements?.Waist || measurements?.waist || 30);
    const hips = parseFloat(measurements?.Hips || measurements?.hips || 38);
    const height = parseFloat(measurements?.Height || measurements?.height || 65);
    const shoulder = parseFloat(measurements?.Shoulder || measurements?.shoulder || 15);
    
    // Normalize to scale (inches to meters approximation)
    const scale = 0.025; // Scale factor for realistic size
    
    return {
      chestRadius: (chest / 2) * scale,
      waistRadius: (waist / 2) * scale,
      hipRadius: (hips / 2) * scale,
      height: height * scale * 0.8,
      shoulderWidth: shoulder * scale,
    };
  }, [measurements]);

  // Create body geometry using LatheGeometry for smooth curves
  const bodyGeometry = useMemo(() => {
    const points = [];
    const { chestRadius, waistRadius, hipRadius, height } = proportions;
    
    // Create body profile points (from bottom to top)
    const segments = 20;
    
    // Feet/ankles
    points.push(new THREE.Vector2(0.15, 0));
    points.push(new THREE.Vector2(0.18, 0.1));
    
    // Calves
    points.push(new THREE.Vector2(0.22, 0.3));
    
    // Knees
    points.push(new THREE.Vector2(0.20, 0.5));
    
    // Thighs
    points.push(new THREE.Vector2(hipRadius * 0.85, 0.7));
    
    // Hips
    points.push(new THREE.Vector2(hipRadius, 1.0));
    points.push(new THREE.Vector2(hipRadius * 0.98, 1.1));
    
    // Waist
    points.push(new THREE.Vector2(waistRadius, 1.3));
    
    // Torso to chest
    points.push(new THREE.Vector2(waistRadius * 1.1, 1.5));
    points.push(new THREE.Vector2(chestRadius, 1.7));
    
    // Chest
    points.push(new THREE.Vector2(chestRadius, 1.85));
    
    // Shoulders/neck
    points.push(new THREE.Vector2(chestRadius * 0.9, 2.0));
    points.push(new THREE.Vector2(0.15, 2.1));
    
    // Neck
    points.push(new THREE.Vector2(0.12, 2.2));
    points.push(new THREE.Vector2(0.12, 2.3));
    
    return new THREE.LatheGeometry(points, 32);
  }, [proportions]);

  // Skin material
  const skinMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f4d4b8',
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  return (
    <group ref={meshRef}>
      {/* Main body */}
      <mesh geometry={bodyGeometry} material={skinMaterial} castShadow receiveShadow>
        <meshStandardMaterial color="#f4d4b8" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#f4d4b8" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 2.65, 0]} castShadow>
        <sphereGeometry args={[0.23, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} metalness={0.0} />
      </mesh>
      
      {/* Arms */}
      <group>
        {/* Left arm */}
        <mesh position={[-proportions.chestRadius - 0.15, 1.8, 0]} rotation={[0, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.8, 16]} />
          <meshStandardMaterial color="#f4d4b8" roughness={0.8} metalness={0.1} />
        </mesh>
        
        {/* Right arm */}
        <mesh position={[proportions.chestRadius + 0.15, 1.8, 0]} rotation={[0, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.8, 16]} />
          <meshStandardMaterial color="#f4d4b8" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 3D Garment Component
 * Renders garment on top of body model
 */
function GarmentModel({ garmentType, silhouette, selectedFabric, measurements, neckline, sleeve }) {
  const meshRef = useRef();
  
  const proportions = useMemo(() => {
    const chest = parseFloat(measurements?.Chest || measurements?.chest || 36);
    const waist = parseFloat(measurements?.Waist || measurements?.waist || 30);
    const hips = parseFloat(measurements?.Hips || measurements?.hips || 38);
    const scale = 0.025;
    
    return {
      chestRadius: (chest / 2) * scale + 0.02, // Slightly larger than body
      waistRadius: (waist / 2) * scale + 0.02,
      hipRadius: (hips / 2) * scale + 0.02,
    };
  }, [measurements]);

  // Create garment geometry based on silhouette
  const garmentGeometry = useMemo(() => {
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
    } else if (silhouette === 'Sheath') {
      hemRadius = hipRadius * 1.05;
      hemHeight = 0.8;
    }
    
    // Adjust based on garment type
    if (garmentType === 'Short Kurthi' || garmentType === 'Crop Top & Skirt') {
      hemHeight = 1.1;
    } else if (garmentType === 'Kurthi') {
      hemHeight = 0.8;
    } else if (garmentType === 'Gown' || garmentType === 'Anarkali' || garmentType === 'Lehenga') {
      hemHeight = 0.1;
    }
    
    // Build garment profile
    points.push(new THREE.Vector2(hemRadius, hemHeight));
    points.push(new THREE.Vector2(hipRadius * 1.02, 1.0));
    points.push(new THREE.Vector2(waistRadius * 1.02, 1.3));
    points.push(new THREE.Vector2(chestRadius * 1.02, 1.7));
    points.push(new THREE.Vector2(chestRadius * 0.95, 1.85));
    
    return new THREE.LatheGeometry(points, 32);
  }, [proportions, silhouette, garmentType]);

  // Fabric material
  const fabricMaterial = useMemo(() => {
    const color = selectedFabric?.color || '#e8d5c4';
    
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
  }, [selectedFabric]);

  return (
    <mesh ref={meshRef} geometry={garmentGeometry} material={fabricMaterial} castShadow receiveShadow />
  );
}

/**
 * Main 3D Preview Component
 */
const Realistic3DPreview = ({
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
  const [autoRotate, setAutoRotate] = useState(false);

  return (
    <div className="realistic-3d-preview">
      <Canvas shadows camera={{ position: [0, 2, 4], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          {/* Environment for reflections */}
          <Environment preset="studio" />
          
          {/* 3D Models */}
          <BodyModel measurements={measurements} bodyShape={bodyShape} />
          <GarmentModel
            garmentType={garmentType}
            silhouette={silhouette}
            selectedFabric={selectedFabric}
            measurements={measurements}
            neckline={neckline}
            sleeve={sleeve}
          />
          
          {/* Ground shadow */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
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
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
      
      {/* Controls overlay */}
      <div className="preview-controls-3d">
        <button
          className="control-btn-3d"
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
        >
          {autoRotate ? '⏸' : '▶'} Rotate
        </button>
        <div className="control-hint">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
      
      {/* Info badges */}
      <div className="preview-info-3d">
        <div className="info-badge-3d">
          <span className="badge-label-3d">Body Type:</span>
          <span className="badge-value-3d">{bodyShape || 'Custom'}</span>
        </div>
        <div className="info-badge-3d">
          <span className="badge-label-3d">Silhouette:</span>
          <span className="badge-value-3d">{silhouette}</span>
        </div>
        {selectedFabric && (
          <div className="info-badge-3d">
            <span className="badge-label-3d">Fabric:</span>
            <span className="badge-value-3d">{selectedFabric.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Realistic3DPreview;
