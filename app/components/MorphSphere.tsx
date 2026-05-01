"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NOISE_GLSL = /* glsl */ `
vec3 _mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 _mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 _permute(vec4 x){return _mod289v4(((x*34.)+1.)*x);}
vec4 _taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=_mod289(i);
  vec4 p=_permute(_permute(_permute(
    i.z+vec4(0.,i1.z,i2.z,1.))+
    i.y+vec4(0.,i1.y,i2.y,1.))+
    i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=_taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const vertexShader = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uDistortion;
uniform float uExplosion;
uniform float uScale;

varying vec3 vNormal;
varying vec3 vViewPos;

void main() {
  float n1 = snoise(position * 1.3 + uTime * 0.22);
  float n2 = snoise(position * 3.1 + uTime * 0.38) * 0.3;
  float disp = (n1 + n2) * uDistortion * 0.65;

  vec3 newPos = position + normal * disp;
  newPos += normalize(position) * uExplosion * 5.0;
  newPos *= uScale;

  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(newPos, 1.0);
  vViewPos = mvPos.xyz;

  gl_Position = projectionMatrix * mvPos;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uBrightness;

varying vec3 vNormal;
varying vec3 vViewPos;

void main() {
  vec3 viewDir = normalize(-vViewPos);
  float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.5);

  vec3 col = uColor * uBrightness * (0.07 + fresnel * 2.1);
  float alpha = (fresnel * 0.88 + 0.12) * uOpacity;

  gl_FragColor = vec4(col, alpha);
}
`;

function s(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

type Props = { scrollProgress: React.MutableRefObject<number> };

export default function MorphSphere({ scrollProgress }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uDistortion: { value: 0.25 },
      uExplosion:  { value: 0 },
      uScale:      { value: 0.4 },
      uColor:      { value: new THREE.Color("#00e5ff") },
      uOpacity:    { value: 1 },
      uBrightness: { value: 1 },
    }),
    []
  );

  const colors = useMemo(() => ({
    cyan:    new THREE.Color("#00e5ff"),
    purple:  new THREE.Color("#aa44ff"),
    magenta: new THREE.Color("#ff00cc"),
    white:   new THREE.Color("#ffffff"),
    work:    new THREE.Color(),
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = scrollProgress.current;
    const u = uniforms;

    // Time
    u.uTime.value = t;

    // Opacity — sphere is always visible unless during particle phase
    const opacity =
      p < 0.42  ? 1 :
      p < 0.56  ? 1 - (p - 0.42) / 0.14 :
      p < 0.86  ? 0 :
      p < 0.92  ? (p - 0.86) / 0.06 :
      1;
    u.uOpacity.value = opacity;

    // Scale
    const scale =
      p < 0.2  ? 1.0 :
      p < 0.4  ? 1.0 + s(0.2, 0.4, p) * 0.8 :
      p < 0.56 ? 1.8 :
      p < 0.92 ? 0 :
      0.3 + s(0.92, 1.0, p) * 0.3;
    u.uScale.value = Math.max(0, scale);

    // Distortion (scroll-driven base + time-breathing)
    const distBase =
      p < 0.2  ? 0.25 + s(0, 0.2, p) * 0.15 :
      p < 0.4  ? 0.4 + s(0.2, 0.4, p) * 0.5 :
      p < 0.56 ? 0.9 :
      p > 0.9  ? 0.25 :
      0;
    const breathing = Math.sin(t * 0.55) * 0.06;
    u.uDistortion.value = distBase + breathing;

    // Explosion
    u.uExplosion.value = p < 0.4 ? 0 : p < 0.56 ? s(0.4, 0.56, p) : 1;

    // Color
    const { cyan, purple, magenta, white, work } = colors;
    if (p < 0.25)      work.copy(cyan);
    else if (p < 0.45) work.lerpColors(cyan, purple, s(0.25, 0.45, p));
    else if (p < 0.65) work.copy(purple);
    else if (p < 0.82) work.lerpColors(purple, magenta, s(0.65, 0.82, p));
    else               work.lerpColors(magenta, white, s(0.82, 0.96, p));
    u.uColor.value.copy(work);

    // Brightness boost → drives Bloom for supernova flash
    u.uBrightness.value = p < 0.88 ? 1 : 1 + s(0.88, 0.96, p) * 14;

    // Gentle rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 128, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
