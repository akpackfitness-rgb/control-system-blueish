import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface SplashScreenProps {
  onComplete: () => void;
}

function AnimatedDots() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{ display: "inline-block", minWidth: "2.2em", textAlign: "left" }}
    >
      {".".repeat(dots)}
    </span>
  );
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);
    camera.position.z = 6;

    const count = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const original: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < count; i++) {
      const r = 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.push(x, y, z);
      original.push(x, y, z);
      colors.push(0.2, 0.8, 1);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let lockedPositions: number[] | null = null;
    let animId: number;

    function animate() {
      animId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) / 1000;
      const pos = geometry.attributes.position.array as Float32Array;
      const col = geometry.attributes.color.array as Float32Array;
      const tNow = performance.now() * 0.002;

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const intensity = (Math.sin(tNow + i * 0.01) + 1) / 2;
        col[ix] = 0.0 + intensity * 0.3;
        col[ix + 1] = 0.7 + intensity * 0.3;
        col[ix + 2] = 1.0;
      }
      geometry.attributes.color.needsUpdate = true;

      if (time < 1) {
        points.rotation.y += 0.001;
      } else if (time < 2) {
        const t = time - 1;
        for (let i = 0; i < count; i++) {
          const ix = i * 3;
          const x = original[ix];
          const y = original[ix + 1];
          const z = original[ix + 2];
          const dist = Math.sqrt(x * x + y * y + z * z);
          const force = t * 3;
          pos[ix] = x + (x / dist) * force;
          pos[ix + 1] = y + (y / dist) * force;
          pos[ix + 2] = z + (z / dist) * force;
        }
        geometry.attributes.position.needsUpdate = true;
      } else if (time < 2.2 && !lockedPositions) {
        lockedPositions = [...pos];
      } else if (lockedPositions) {
        for (let i = 0; i < count; i++) {
          const ix = i * 3;
          const x = lockedPositions[ix];
          const y = lockedPositions[ix + 1];
          const z = lockedPositions[ix + 2];
          const wave = Math.sin(tNow + (x + y + z) * 2) * 0.08;
          pos[ix] = x + wave;
          pos[ix + 1] = y + wave;
          pos[ix + 2] = z + wave;
        }
        geometry.attributes.position.needsUpdate = true;
        points.rotation.y += 0.0008;
      }

      renderer.render(scene, camera);
    }

    const startTime = performance.now();
    animate();

    const fadeTimer = setTimeout(() => setFadeOut(true), 4500);
    const doneTimer = setTimeout(() => onComplete(), 5200);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 9999,
        transition: "opacity 0.7s ease",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#E1F5FE",
          fontSize: "28px",
          letterSpacing: "2px",
          opacity: 0.9,
          fontFamily: "Arial, sans-serif",
          textShadow: "0 0 20px rgba(0,200,255,0.6)",
          pointerEvents: "none",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        scanning
        <AnimatedDots />
      </div>
    </div>
  );
}
