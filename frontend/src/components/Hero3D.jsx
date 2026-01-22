
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Float, 
  Sparkles, 
  Box,
  Cylinder,
  Grid,
  MeshTransmissionMaterial,
  Text,
  useCursor
} from '@react-three/drei';
import * as THREE from 'three';

// A low-poly stylized car
function Car({ color, ...props }) {
  return (
    <group {...props}>
      {/* 
        This is a schematic "Cybertruck-esque" low poly car 
        composed of simple primitives to avoid external assets 
      */}
      
      {/* Main Body */}
      <Box args={[4, 1.2, 2]} position={[0, 0.8, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} envMapIntensity={1} />
      </Box>
      <Box args={[2.5, 0.8, 1.8]} position={[-0.2, 1.8, 0]} castShadow receiveShadow>
         <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </Box>

      {/* Wheels */}
      <Wheel position={[-1.2, 0.4, 1]} />
      <Wheel position={[1.2, 0.4, 1]} />
      <Wheel position={[-1.2, 0.4, -1]} />
      <Wheel position={[1.2, 0.4, -1]} />
      
      {/* Headlights (Cyan for tech look) */}
      <Box args={[0.2, 0.2, 1.6]} position={[2.01, 0.9, 0]}>
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} toneMapped={false} />
      </Box>
      
       {/* Tail lights (Red) */}
      <Box args={[0.2, 0.2, 1.6]} position={[-2.01, 0.9, 0]}>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} />
      </Box>
    </group>
  );
}

function Wheel(props) {
  return (
     <group {...props} rotation={[Math.PI / 2, 0, 0]}>
        <Cylinder args={[0.4, 0.4, 0.4, 32]} castShadow receiveShadow>
          <meshStandardMaterial color="#171717" roughness={0.6} />
        </Cylinder>
        <Cylinder args={[0.25, 0.25, 0.41, 16]}>
           <meshStandardMaterial color="#525252" metalness={0.8} roughness={0.2} />
        </Cylinder>
     </group>
  )
}

function ScannerPlane({ color }) {
  const ref = useRef();
  
  useFrame((state) => {
    // Move scanner back and forth
    const t = state.clock.getElapsedTime();
    if (ref.current) {
        ref.current.position.x = Math.sin(t) * 2.5;
        // Make it pulse opacity maybe?
    }
  });

  return (
    <mesh ref={ref} rotation={[0, 0, 0]} position={[0, 1, 0]}>
      <boxGeometry args={[0.2, 3, 3]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.3} 
        side={THREE.DoubleSide} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
      <group position={[0, 0, 0]}>
          {/* Scanning Line */}
          <Box args={[0.05, 3.2, 3.2]}>
              <meshBasicMaterial color={color} emissive={color} emissiveIntensity={2} />
          </Box>
      </group>
    </mesh>
  );
}

function dataPoints(count) {
    const points = [];
    for(let i=0; i<count; i++) {
        points.push({
            position: [
                (Math.random() - 0.5) * 15, 
                Math.random() * 5 + 1, 
                (Math.random() - 0.5) * 15
            ],
            scale: Math.random() * 0.2 + 0.05
        })
    }
    return points;
}

function DataCloud({ color }) {
    const points = useMemo(() => dataPoints(30), []);
    const ref = useRef();

    useFrame((state) => {
        if(ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    })

    return (
        <group ref={ref}>
            {points.map((p, i) => (
                <Float key={i} speed={2} rotationIntensity={2} floatIntensity={1}>
                     <Box position={p.position} args={[1,1,1]} scale={p.scale}>
                        <meshStandardMaterial 
                            color={color} 
                            emissive={color} 
                            emissiveIntensity={0.5} 
                            transparent 
                            opacity={0.6}
                        />
                     </Box>
                </Float>
            ))}
        </group>
    )
}

function Hero3D() {
  // We need to know the theme. 
  // Since we are not in a context provider here easily without wrapping, 
  // we can check the class on html like the ThemeToggle does, 
  // or use a mutation observer. For simplicity, we'll assume a prop or 
  // use a small hook to listen to class changes on document.documentElement.

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
        setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    // Initial check
    checkTheme();

    // Observer for class changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Theme Colors
  // Dark: Deep cyber blue/cyan
  // Light: Clean professional blue/silver
  const carColor = isDark ? "#3b82f6" : "#e2e8f0"; // Blue-500 vs Slate-200
  const scanColor = isDark ? "#06b6d4" : "#2563eb"; // Cyan-500 vs Blue-600
  const particleColor = isDark ? "#6366f1" : "#3b82f6"; // Indigo-500 vs Blue-500
  const gridColor = isDark ? { section: "#ffffff", cell: "#4b5563" } : { section: "#000000", cell: "#cbd5e1" }; 
  const bgColors = isDark ? ['#020617'] : ['#f8fafc']; // Slate-950 vs Slate-50

  return (
    <div className="w-full h-screen absolute top-0 left-0 -z-0">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 3, 6]} fov={50} />
        <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 2.1}
            autoRotate
            autoRotateSpeed={0.5}
        />
        
        {/* Background Color */}
        <color attach="background" args={bgColors} />
        
        {/* Lighting */}
        <ambientLight intensity={isDark ? 0.2 : 0.8} />
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} castShadow color={isDark ? "#818cf8" : "#ffffff"} />
        <pointLight position={[-10, 5, -10]} intensity={1} color={scanColor} />
        
        {/* Floor Grid */}
        <Grid 
            position={[0, -0.01, 0]} 
            args={[20, 20]} 
            cellColor={gridColor.cell} 
            sectionColor={gridColor.section} 
            cellSize={1} 
            sectionSize={5} 
            fadeDistance={20} 
            fadeStrength={1}
            sectionThickness={1.5}
            cellThickness={0.8}
            opacity={isDark ? 0.2 : 0.1}
        />

        {/* Scene Objects */}
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[0, 0.2]}>
             <Car color={carColor} />
        </Float>
        
        <ScannerPlane color={scanColor} />
        <DataCloud color={particleColor} />
        
        {/* Environment Reflections */}
        <Environment preset={isDark ? "city" : "studio"} />
        
        {/* Sparkles for extra "AI Magic" */}
        <Sparkles 
            count={100} 
            scale={12} 
            size={3} 
            speed={0.4} 
            opacity={0.5} 
            color={scanColor}
            position={[0, 2, 0]} 
        />
      </Canvas>
    </div>
  );
};

export default Hero3D;
