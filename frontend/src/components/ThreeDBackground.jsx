import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import HomeImage from '../Assets/Home.png';
import DarkImage from '../Assets/dark.jpeg';

const BackgroundPlane = () => {
  const { theme } = useTheme();
  const meshRef = useRef();
  const { viewport, mouse } = useThree();

  // Load textures
  const textures = useTexture({
    light: HomeImage,
    dark: DarkImage,
  });

  // Select texture based on theme
  const texture = theme === 'dark' ? textures.dark : textures.light;
  
  // Update texture encoding/color space if needed (usually handled by R3F automatically now)
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Parallax effect: Slight rotation/position shift based on mouse
    // Mouse coords are normalized (-1 to 1)
    
    // Smooth interpolation for rotation
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      (state.mouse.y * viewport.height) / 100, // Very subtle tilt
      0.05
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      (state.mouse.x * viewport.width) / 100,
      0.05
    );

    // Slight position shift for depth feel
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      (state.mouse.x * viewport.width) / 80,
      0.05
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      (state.mouse.y * viewport.height) / 80,
      0.05
    );
  });

  // Calculate aspect ratio
  const ratio = texture.image.width / texture.image.height;
  
  // Calculate scale to cover viewport and account for depth/parallax
  // Camera z=5, Plane z=-2 => Scale factor ~1.4 to match viewport at z=0
  // using 1.6 to ensure coverage + parallax movement
  const scale = Math.max(viewport.width / ratio, viewport.height) * 1.6;

  return (
    <mesh ref={meshRef} scale={[scale * ratio, scale, 1]} position={[0, 0, -2]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <meshBasicMaterial 
        map={texture} 
        transparent={true}
        opacity={theme === 'dark' ? 0.6 : 1}
        depthWrite={false}
      />
    </mesh>
  );
};

const ThreeDBackground = () => {
  const { theme } = useTheme();

  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        {/* Lights (mostly for the particles/stars, background uses basic material) */}
        <ambientLight intensity={0.5} />
        
        <BackgroundPlane />

        {/* Add floating particles/stars for 3D depth */}
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        
        <Sparkles 
          count={theme === 'dark' ? 100 : 50}
          scale={10}
          size={theme === 'dark' ? 4 : 6}
          speed={0.4}
          opacity={0.5}
          color={theme === 'dark' ? "#a5b4fc" : "#4f46e5"}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDBackground;
