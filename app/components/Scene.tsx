"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import MorphSphere from "./MorphSphere";
import Particles from "./Particles";

type Props = { scrollProgress: React.MutableRefObject<number> };

// Subtle star field that fades out as we scroll
function Stars({ scrollProgress }: Props) {
  const matRef = useRef<THREE.PointsMaterial>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(2500 * 3);
    for (let i = 0; i < 2500; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 5;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (!matRef.current) return;
    const p = scrollProgress.current;
    matRef.current.opacity = Math.max(0, 1 - p * 5);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.045}
        color="#aaccff"
        transparent
        opacity={1}
        depthWrite={false}
      />
    </points>
  );
}

// Thin ring accent under the sphere
function RingAccent({ scrollProgress }: Props) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(() => {
    if (!matRef.current) return;
    const p = scrollProgress.current;
    const visible = p < 0.38 ? p / 0.38 : p < 0.56 ? 1 - (p - 0.38) / 0.18 : 0;
    matRef.current.opacity = visible * 0.18;
  });

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <torusGeometry args={[3.5, 0.012, 2, 120]} />
      <meshBasicMaterial ref={matRef} color="#00e5ff" transparent opacity={0} />
    </mesh>
  );
}

export default function Scene({ scrollProgress }: Props) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 6.5], fov: 45, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#000000"]} />

      <Stars       scrollProgress={scrollProgress} />
      <RingAccent  scrollProgress={scrollProgress} />
      <MorphSphere scrollProgress={scrollProgress} />
      <Particles   scrollProgress={scrollProgress} />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.04}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.95} />
      </EffectComposer>
    </Canvas>
  );
}
