import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import './MannequinPreview.css';

/**
 * AI-Enhanced Realistic Mannequin
 * Creates a more realistic mannequin using procedural generation
 */
function AIRealisticMannequin({ measurements }) {
  const groupRef = useRef();
  
  const proportions = React.useMemo(() => {
    const chest = parseFloat(measurements?.Chest || measurements?.chest || 36);
    const waist = parseFloat(measurements?.Waist || measurements?.waist || 30);
    const hips = parseFloat(measurements?.Hips || measurements?.hips || 38);
    const height = parseFloat(measurements?.Height || measurements?.height || 65);
    const shoulder = parseFloat(measurements?.Shoulder || measurements?.shoulder || 15);
    
    const scale = 0.025;
    
    return {
      chestRadius: (chest / 2) * scale,
      waistRadius: (waist / 2) * scale,
      hipRadius: (hips / 2) * scale,
      height: height * scale * 0.8,
      shoulderWidth: (shoulder / 2) * scale,
    };
  }, [measurements]);
  
  // Skin material with realistic properties
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: '#f5d4c1',
    roughness: 0.6,
    metalness: 0.1,
    emissive: '#ffeedd',
    emissiveIntensity: 0.05,
  });
  
  // Hair material
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: '#3d2817',
    roughness: 0.9,
    metalness: 0.0,
  });
  
  // Eye material
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: '#4a3728',
    roughness: 0.3,
    metalness: 0.1,
  });
  
  // Lip material
  const lipMaterial = new THREE.MeshStandardMaterial({
    color: '#d4958c',
    roughness: 0.4,
    metalness: 0.1,
  });
  
  return (
    <group ref={groupRef}>
      {/* Head with realistic shape */}
      <group position={[0, 2.5, 0]}>
        {/* Main head */}
        <Sphere args={[0.22, 32, 32]} material={skinMaterial} castShadow>
          <meshStandardMaterial {...skinMaterial} />
        </Sphere>
        
        {/* Eyes */}
        <Sphere args={[0.025, 16, 16]} position={[-0.08, 0.05, 0.18]} material={eyeMaterial} />
        <Sphere args={[0.025, 16, 16]} position={[0.08, 0.05, 0.18]} material={eyeMaterial} />
        
        {/* Eye whites */}
        <Sphere args={[0.03, 16, 16]} position={[-0.08, 0.05, 0.17]}>
          <meshStandardMaterial color="white" roughness={0.3} />
        </Sphere>
        <Sphere args={[0.03, 16, 16]} position={[0.08, 0.05, 0.17]}>
          <meshStandardMaterial color="white" roughness={0.3} />
        </Sphere>
        
        {/* Nose */}
        <Box args={[0.04, 0.08, 0.06]} position={[0, 0, 0.2]} material={skinMaterial} />
        
        {/* Lips */}
        <Sphere args={[0.06, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} 
                position={[0, -0.08, 0.19]} 
                rotation={[Math.PI, 0, 0]}
                material={lipMaterial} />
        
        {/* Eyebrows */}
        <Box args={[0.08, 0.015, 0.01]} position={[-0.08, 0.12, 0.18]}>
          <meshStandardMaterial color="#2d1f15" roughness={0.9} />
        </Box>
        <Box args={[0.08, 0.015, 0.01]} position={[0.08, 0.12, 0.18]}>
          <meshStandardMaterial color="#2d1f15" roughness={0.9} />
        </Box>
      </group>
      
      {/* Hair - realistic bob cut */}
      <group position={[0, 2.5, 0]}>
        {/* Top of hair */}
        <Sphere args={[0.24, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} 
                position={[0, 0.1, 0]} 
                material={hairMaterial} 
                castShadow />
        
        {/* Hair sides */}
        <Sphere args={[0.23, 32, 32]} 
                position={[-0.15, -0.05, 0]} 
                scale={[0.8, 1.2, 0.8]}
                material={hairMaterial} 
                castShadow />
        <Sphere args={[0.23, 32, 32]} 
                position={[0.15, -0.05, 0]} 
                scale={[0.8, 1.2, 0.8]}
                material={hairMaterial} 
                castShadow />
        
        {/* Hair back */}
        <Sphere args={[0.22, 32, 32]} 
                position={[0, -0.05, -0.1]} 
                scale={[1, 1.3, 0.9]}
                material={hairMaterial} 
                castShadow />
      </group>
      
      {/* Neck */}
      <Cylinder args={[0.10, 0.12, 0.3, 16]} 
                position={[0, 2.15, 0]} 
                material={skinMaterial} 
                castShadow />
      
      {/* Shoulders */}
      <Sphere args={[0.12, 16, 16]} position={[-proportions.shoulderWidth - 0.15, 1.95, 0]} material={skinMaterial} castShadow />
      <Sphere args={[0.12, 16, 16]} position={[proportions.shoulderWidth + 0.15, 1.95, 0]} material={skinMaterial} castShadow />
      
      {/* Torso - realistic shape */}
      <group>
        {/* Upper chest */}
        <Sphere args={[proportions.chestRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI]} 
                position={[0, 1.7, 0]} 
                scale={[1, 0.6, 0.8]}
                material={skinMaterial} 
                castShadow />
        
        {/* Mid torso */}
        <Cylinder args={[proportions.chestRadius, proportions.waistRadius, 0.6, 32]} 
                  position={[0, 1.4, 0]} 
                  material={skinMaterial} 
                  castShadow />
        
        {/* Waist to hips */}
        <Cylinder args={[proportions.waistRadius, proportions.hipRadius, 0.6, 32]} 
                  position={[0, 0.9, 0]} 
                  material={skinMaterial} 
                  castShadow />
        
        {/* Hips */}
        <Sphere args={[proportions.hipRadius, 32, 32]} 
                position={[0, 0.7, 0]} 
                scale={[1, 0.5, 0.9]}
                material={skinMaterial} 
                castShadow />
      </group>
      
      {/* Arms - realistic with joints and hands */}
      <group>
        {/* Left arm */}
        <Cylinder args={[0.07, 0.06, 0.35, 16]} 
                  position={[-proportions.chestRadius - 0.2, 1.65, 0]} 
                  rotation={[0, 0, 0.2]}
                  material={skinMaterial} 
                  castShadow />
        <Cylinder args={[0.06, 0.05, 0.35, 16]} 
                  position={[-proportions.chestRadius - 0.28, 1.35, 0]} 
                  rotation={[0, 0, 0.15]}
                  material={skinMaterial} 
                  castShadow />
        {/* Left Hand - Tapered for realism */}
        <mesh position={[-proportions.chestRadius - 0.32, 1.15, 0]} rotation={[0, 0, 0.2]} castShadow>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial {...skinMaterial} />
        </mesh>
        {/* Left Thumb */}
        <mesh position={[-proportions.chestRadius - 0.28, 1.2, 0.05]} castShadow>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial {...skinMaterial} />
        </mesh>
        
        {/* Right arm */}
        <Cylinder args={[0.07, 0.06, 0.35, 16]} 
                  position={[proportions.chestRadius + 0.2, 1.65, 0]} 
                  rotation={[0, 0, -0.2]}
                  material={skinMaterial} 
                  castShadow />
        <Cylinder args={[0.06, 0.05, 0.35, 16]} 
                  position={[proportions.chestRadius + 0.28, 1.35, 0]} 
                  rotation={[0, 0, -0.15]}
                  material={skinMaterial} 
                  castShadow />
        {/* Right Hand - Tapered for realism */}
        <mesh position={[proportions.chestRadius + 0.32, 1.15, 0]} rotation={[0, 0, -0.2]} castShadow>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial {...skinMaterial} />
        </mesh>
        {/* Right Thumb */}
        <mesh position={[proportions.chestRadius + 0.28, 1.2, 0.05]} castShadow>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial {...skinMaterial} />
        </mesh>
      </group>
      
      {/* Legs - realistic proportions */}
      <group>
        {/* Left leg - thigh */}
        <Cylinder args={[proportions.hipRadius * 0.7, proportions.hipRadius * 0.55, 0.5, 16]} 
                  position={[-proportions.hipRadius * 0.4, 0.25, 0]} 
                  material={skinMaterial} 
                  castShadow />
        {/* Left leg - calf */}
        <Cylinder args={[proportions.hipRadius * 0.5, 0.15, 0.5, 16]} 
                  position={[-proportions.hipRadius * 0.4, -0.25, 0]} 
                  material={skinMaterial} 
                  castShadow />
        
        {/* Right leg - thigh */}
        <Cylinder args={[proportions.hipRadius * 0.7, proportions.hipRadius * 0.55, 0.5, 16]} 
                  position={[proportions.hipRadius * 0.4, 0.25, 0]} 
                  material={skinMaterial} 
                  castShadow />
        {/* Right leg - calf */}
        <Cylinder args={[proportions.hipRadius * 0.5, 0.15, 0.5, 16]} 
                  position={[proportions.hipRadius * 0.4, -0.25, 0]} 
                  material={skinMaterial} 
                  castShadow />
      </group>
      
      {/* Base stand - professional display */}
      <group position={[0, -0.5, 0]}>
        <Cylinder args={[0.3, 0.3, 0.05, 32]} receiveShadow>
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.4} />
        </Cylinder>
        <Cylinder args={[0.05, 0.05, 0.5, 16]} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.5} />
        </Cylinder>
      </group>
    </group>
  );
}

/**
 * Garment Overlay (same as before)
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
 * Main Component
 */
const AIRealisticMannequinPreview = (props) => {
  const [autoRotate, setAutoRotate] = useState(false);
  
  return (
    <div className="mannequin-preview">
      <Canvas shadows camera={{ position: [0, 2, 4], fov: 50 }}>
        <Suspense fallback={null}>
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
          
          <Environment preset="studio" />
          
          <AIRealisticMannequin measurements={props.measurements} />
          <GarmentOverlay
            garmentType={props.garmentType}
            silhouette={props.silhouette}
            selectedFabric={props.selectedFabric}
            measurements={props.measurements}
          />
          
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />
          
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
      
      <div className="mannequin-info">
        <div className="info-badge-mannequin realistic-badge">
          <span>🤖 AI-Enhanced Mannequin</span>
        </div>
        <div className="info-badge-mannequin">
          <span className="badge-label">Body:</span>
          <span className="badge-value">{props.bodyShape || 'Custom'}</span>
        </div>
        <div className="info-badge-mannequin">
          <span className="badge-label">Style:</span>
          <span className="badge-value">{props.silhouette}</span>
        </div>
        {props.selectedFabric && (
          <div className="info-badge-mannequin">
            <span className="badge-label">Fabric:</span>
            <span className="badge-value">{props.selectedFabric.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRealisticMannequinPreview;
