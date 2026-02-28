import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function WelcomeScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(6, 4, 10);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x8899bb, 1.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xaaccff, 3);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 4, 40);
    purpleLight.position.set(-5, 4, -3);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 4, 40);
    blueLight.position.set(5, 4, 5);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 30);
    cyanLight.position.set(0, 3, -5);

    const topLight = new THREE.PointLight(0xffffff, 2, 50);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);
    scene.add(cyanLight);

    // ── Ground — reflective dark surface ──
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a,
      metalness: 0.9,
      roughness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.51;
    scene.add(ground);

    // ── Neon grid lines ──
    const gridGroup = new THREE.Group();
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.3 });
    for (let i = -50; i <= 50; i += 2) {
      const pts1 = [new THREE.Vector3(i, 0, -50), new THREE.Vector3(i, 0, 50)];
      const pts2 = [new THREE.Vector3(-50, 0, i), new THREE.Vector3(50, 0, i)];
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts1), gridMat));
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2), gridMat));
    }
    scene.add(gridGroup);

    // ── Glowing accent lines (closer) ──
    const accentMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 });
    for (let i = -10; i <= 10; i += 4) {
      const pts = [new THREE.Vector3(i, -1.5, -20), new THREE.Vector3(i, -1.5, 20)];
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), accentMat));
    }

    // ── Car body — sleek sedan shape ──
    const carGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x6699cc,
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 2,
    });

    // Lower body
    const lowerGeo = new THREE.BoxGeometry(4.2, 0.8, 1.8);
    const lower = new THREE.Mesh(lowerGeo, bodyMat);
    lower.position.y = 0.6;
    carGroup.add(lower);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(2.4, 0.7, 1.6);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x334466,
      metalness: 0.9,
      roughness: 0.1,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.2, 1.35, 0);
    carGroup.add(cabin);

    // Hood slope
    const hoodGeo = new THREE.BoxGeometry(0.8, 0.3, 1.5);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(1.4, 1.1, 0);
    hood.rotation.z = -0.15;
    carGroup.add(hood);

    // Trunk slope
    const trunkGeo = new THREE.BoxGeometry(0.6, 0.25, 1.5);
    const trunk = new THREE.Mesh(trunkGeo, bodyMat);
    trunk.position.set(-1.5, 1.1, 0);
    trunk.rotation.z = 0.15;
    carGroup.add(trunk);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.22, 12);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1, roughness: 0.1 });

    const wheelPositions = [
      [1.4, 0.35, 1.0], [1.4, 0.35, -1.0],
      [-1.3, 0.35, 1.0], [-1.3, 0.35, -1.0],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, y, z);
      wheel.rotation.x = Math.PI / 2;
      carGroup.add(wheel);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(x, y, z);
      rim.rotation.x = Math.PI / 2;
      carGroup.add(rim);
    });

    // Headlights glow
    const headlightGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xccddff });
    [0.6, -0.6].forEach(z => {
      const hl = new THREE.Mesh(headlightGeo, headlightMat);
      hl.position.set(2.1, 0.7, z);
      carGroup.add(hl);
      const hlLight = new THREE.PointLight(0xccddff, 2, 8);
      hlLight.position.set(2.3, 0.7, z);
      carGroup.add(hlLight);
    });

    // Taillights
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff2244 });
    [0.6, -0.6].forEach(z => {
      const tl = new THREE.Mesh(headlightGeo, taillightMat);
      tl.position.set(-2.1, 0.7, z);
      carGroup.add(tl);
    });

    // Neon underglow
    const underglowMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 });
    const underglowGeo = new THREE.PlaneGeometry(4.5, 2);
    const underglow = new THREE.Mesh(underglowGeo, underglowMat);
    underglow.rotation.x = -Math.PI / 2;
    underglow.position.y = 0.05;
    carGroup.add(underglow);

    // Position car
    carGroup.position.set(0, 0, 0);
    carGroup.rotation.y = -0.3;
    scene.add(carGroup);

    // ── Floating particles / stars ──
    const particleCount = 500;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 100;
      particlePositions[i * 3 + 1] = Math.random() * 40 + 1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.7, 0.6);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Floating holographic rings ──
    const ringGeo = new THREE.TorusGeometry(1.2, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.set(0, 1.5, 0);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.8, 0.015, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.position.set(0, 1.5, 0);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);

    // ── Animation loop ──
    let time = 0;
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.005;

      // Slow camera orbit
      camera.position.x = 10 * Math.cos(time * 0.3);
      camera.position.z = 10 * Math.sin(time * 0.3);
      camera.position.y = 2.5 + Math.sin(time * 0.5) * 0.5;
      camera.lookAt(0, -0.5, 0);

      // Car subtle float (lowered)
      carGroup.position.y = -1.5 + Math.sin(time * 2) * 0.05;

      // Rings rotate
      ring1.rotation.z = time;
      ring2.rotation.z = -time * 0.7;
      ring2.rotation.x = Math.sin(time) * 0.5;

      // Particles drift
      particles.rotation.y = time * 0.05;

      // Pulsing underglow
      underglowMat.opacity = 0.3 + Math.sin(time * 3) * 0.15;

      // Lights pulse
      purpleLight.intensity = 2 + Math.sin(time * 2) * 0.5;
      blueLight.intensity = 2 + Math.cos(time * 2.5) * 0.5;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%', height: '100%',
      }}
    />
  );
}
