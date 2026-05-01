"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 20_000;

const vertexShader = /* glsl */ `
uniform float uSize;
void main() {
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * (280.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float a = (1.0 - d * 2.0);
  a = a * a * uOpacity;
  gl_FragColor = vec4(uColor, a);
}
`;

function smooth(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

type Props = { scrollProgress: React.MutableRefObject<number> };

export default function Particles({ scrollProgress }: Props) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { spherePos, scatterPos, torusPos, centerPos, currentPos } = useMemo(() => {
    const spherePos  = new Float32Array(COUNT * 3);
    const scatterPos = new Float32Array(COUNT * 3);
    const torusPos   = new Float32Array(COUNT * 3);
    const centerPos  = new Float32Array(COUNT * 3); // stays zero
    const currentPos = new Float32Array(COUNT * 3);

    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    const R = 2.6, r = 0.7; // torus radii

    for (let i = 0; i < COUNT; i++) {
      // Fibonacci sphere (radius 2.0)
      const y  = 1 - (i / (COUNT - 1)) * 2;
      const rr = Math.sqrt(1 - y * y);
      const th = phi * i;
      spherePos[i * 3]     = rr * Math.cos(th) * 2.0;
      spherePos[i * 3 + 1] = y * 2.0;
      spherePos[i * 3 + 2] = rr * Math.sin(th) * 2.0;

      // Scatter: radially outward from sphere positions
      const sx = spherePos[i * 3], sy = spherePos[i * 3 + 1], sz = spherePos[i * 3 + 2];
      const len = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
      const dist = 3.5 + Math.random() * 5.5;
      scatterPos[i * 3]     = (sx / len) * dist;
      scatterPos[i * 3 + 1] = (sy / len) * dist;
      scatterPos[i * 3 + 2] = (sz / len) * dist;

      // Torus: parametric surface
      const tTheta = (i / COUNT) * Math.PI * 2;
      const tPhi   = Math.random() * Math.PI * 2;
      torusPos[i * 3]     = (R + r * Math.cos(tPhi)) * Math.cos(tTheta);
      torusPos[i * 3 + 1] = r * Math.sin(tPhi);
      torusPos[i * 3 + 2] = (R + r * Math.cos(tPhi)) * Math.sin(tTheta);
    }

    currentPos.set(spherePos);
    return { spherePos, scatterPos, torusPos, centerPos, currentPos };
  }, []);

  const uniforms = useMemo(
    () => ({
      uSize:    { value: 2.5 },
      uColor:   { value: new THREE.Color("#00e5ff") },
      uOpacity: { value: 0 },
    }),
    []
  );

  const colors = useMemo(() => ({
    cyan:    new THREE.Color("#00e5ff"),
    magenta: new THREE.Color("#ff00cc"),
    work:    new THREE.Color(),
  }), []);

  useFrame((state) => {
    const p = scrollProgress.current;
    if (!pointsRef.current) return;

    // Opacity window: visible only during states 2-4
    const opacity =
      p < 0.38 ? 0 :
      p < 0.45 ? (p - 0.38) / 0.07 :
      p < 0.88 ? 1 :
      p < 0.95 ? 1 - (p - 0.88) / 0.07 :
      0;

    uniforms.uOpacity.value = opacity;

    if (opacity <= 0.01) return;

    // Position interpolation
    let fromArr: Float32Array, toArr: Float32Array, t: number;

    if (p < 0.56) {
      fromArr = spherePos; toArr = scatterPos; t = smooth(0.4, 0.58, p);
    } else if (p < 0.75) {
      fromArr = scatterPos; toArr = torusPos; t = smooth(0.56, 0.75, p);
    } else if (p < 0.86) {
      fromArr = torusPos; toArr = torusPos; t = 0;
    } else {
      fromArr = torusPos; toArr = centerPos; t = smooth(0.86, 0.96, p);
    }

    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr  = attr.array as Float32Array;
    for (let i = 0; i < COUNT * 3; i++) {
      arr[i] = fromArr[i] + (toArr[i] - fromArr[i]) * t;
    }
    attr.needsUpdate = true;

    // Color: cyan → magenta as particles go from scatter to torus
    const { cyan, magenta, work } = colors;
    work.lerpColors(cyan, magenta, smooth(0.56, 0.78, p));
    uniforms.uColor.value.copy(work);

    // Slow rotation
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.035;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[currentPos, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
