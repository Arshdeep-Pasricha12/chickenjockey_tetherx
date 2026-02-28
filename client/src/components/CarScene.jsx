import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

const CAR_PARTS = [
  { name: 'Engine', key: 'engineTemp', position: [0.6, 0.55, 0], color: '#ef4444', emoji: '🔥', desc: 'Core powertrain — monitors temperature and performance', unit: '°C' },
  { name: 'Tires', key: 'tirePressure', position: [-0.9, 0.05, 0.55], color: '#3b82f6', emoji: '🛞', desc: 'Tire pressure affects grip, fuel economy, and safety', unit: 'psi' },
  { name: 'Battery', key: 'batteryVoltage', position: [0.4, 0.55, -0.45], color: '#f59e0b', emoji: '🔋', desc: 'Powers all electronics, ignition, and starter motor', unit: 'V' },
  { name: 'Brakes', key: 'brakeThickness', position: [-0.5, 0.08, 0.6], color: '#8b5cf6', emoji: '🛑', desc: 'Brake pad thickness — critical for stopping power', unit: 'mm' },
  { name: 'Fuel Tank', key: 'fuelLevel', position: [-0.4, 0.25, -0.45], color: '#10b981', emoji: '⛽', desc: 'Fuel level — plan your refueling stops', unit: '%' },
  { name: 'Oil System', key: 'oilPressure', position: [0.7, 0.35, 0.4], color: '#f97316', emoji: '🛢️', desc: 'Oil pressure keeps engine parts lubricated and cool', unit: 'psi' },
  { name: 'Speedometer', key: 'speed', position: [0, 0.7, 0], color: '#06b6d4', emoji: '⚡', desc: 'Current vehicle speed — drive safe!', unit: 'km/h' },
  { name: 'RPM Gauge', key: 'rpm', position: [0.3, 0.7, 0.3], color: '#ec4899', emoji: '🔄', desc: 'Engine revolutions per minute', unit: 'rpm' },
];

function getHealthColor(key, value) {
  const thresholds = {
    speed: { danger: 160, warn: 120 },
    engineTemp: { danger: 120, warn: 105 },
    rpm: { danger: 7000, warn: 6000 },
    oilPressure: { danger: 15, warn: 25, invert: true },
    tirePressure: { danger: 25, warn: 30, invert: true },
    batteryVoltage: { danger: 11.8, warn: 12.4, invert: true },
    fuelLevel: { danger: 10, warn: 20, invert: true },
    brakeThickness: { danger: 2, warn: 4, invert: true },
  };
  const t = thresholds[key];
  if (!t) return '#10b981';
  if (t.invert) {
    if (value < t.danger) return '#ef4444';
    if (value < t.warn) return '#f59e0b';
    return '#10b981';
  }
  if (value > t.danger) return '#ef4444';
  if (value > t.warn) return '#f59e0b';
  return '#10b981';
}

export default function CarScene({ params = {} }) {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const hotspotMeshes = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.06);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 2.8, 4.5);
    camera.lookAt(0, 0.3, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // OrbitControls — user drag-to-rotate
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 8;
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 0.3, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xb0c4de, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    sunLight.position.set(5, 10, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(0x3b82f6, 0.6, 15);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x8b5cf6, 0.4, 12);
    rimLight.position.set(3, 2, -4);
    scene.add(rimLight);

    // ═══ GROUND & ROAD ═══
    // Ground plane (grass)
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2d5a27,
      roughness: 0.9,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road
    const roadGeo = new THREE.PlaneGeometry(3.5, 20);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.85,
      metalness: 0.05,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.005;
    scene.add(road);

    // Road center lines (dashed)
    for (let i = -8; i < 8; i += 1.5) {
      const lineGeo = new THREE.PlaneGeometry(0.08, 0.7);
      const lineMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0x554400, emissiveIntensity: 0.2 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.01, i);
      scene.add(line);
    }

    // Road edge lines
    [-1.6, 1.6].forEach(x => {
      const edgeGeo = new THREE.PlaneGeometry(0.06, 20);
      const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x444444, emissiveIntensity: 0.1 });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(x, 0.01, 0);
      scene.add(edge);
    });

    // Sidewalk/curb
    [-2.0, 2.0].forEach(x => {
      const curbGeo = new THREE.BoxGeometry(0.3, 0.08, 20);
      const curbMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.7 });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(x, 0.04, 0);
      curb.castShadow = true;
      scene.add(curb);
    });

    // ═══ TRAFFIC LIGHT ═══
    const trafficGroup = new THREE.Group();
    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.25;
    pole.castShadow = true;
    trafficGroup.add(pole);

    // Box
    const tlBoxGeo = new THREE.BoxGeometry(0.22, 0.55, 0.15);
    const tlBoxMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.4 });
    const tlBox = new THREE.Mesh(tlBoxGeo, tlBoxMat);
    tlBox.position.y = 2.6;
    tlBox.castShadow = true;
    trafficGroup.add(tlBox);

    // Lights (red, yellow, green)
    const lightColors = [
      { color: 0xff0000, emissive: 0xff2222, y: 2.78, intensity: 0.4 },
      { color: 0xffaa00, emissive: 0xffaa00, y: 2.60, intensity: 0.1 },
      { color: 0x00ff00, emissive: 0x00ff44, y: 2.42, intensity: 0.8 },
    ];
    lightColors.forEach(l => {
      const lightGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const lightMat = new THREE.MeshStandardMaterial({
        color: l.color, emissive: l.emissive, emissiveIntensity: l.intensity,
      });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.set(0, l.y, 0.08);
      trafficGroup.add(lightMesh);
    });

    trafficGroup.position.set(2.3, 0, -2.5);
    scene.add(trafficGroup);

    // Second traffic light on the other side
    const tl2 = trafficGroup.clone();
    tl2.position.set(-2.3, 0, 2.5);
    tl2.rotation.y = Math.PI;
    scene.add(tl2);

    // ═══ TREES / BUSHES ═══
    const createTree = (x, z, scale = 1) => {
      const treeGroup = new THREE.Group();
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 0.6 * scale, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.3 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Foliage (layered cones)
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
      [0, 0.25, 0.45].forEach((yOff, i) => {
        const r = (0.35 - i * 0.08) * scale;
        const h = (0.4 - i * 0.05) * scale;
        const fGeo = new THREE.ConeGeometry(r, h, 7);
        const foliage = new THREE.Mesh(fGeo, foliageMat);
        foliage.position.y = (0.65 + yOff) * scale;
        foliage.castShadow = true;
        treeGroup.add(foliage);
      });

      treeGroup.position.set(x, 0, z);
      return treeGroup;
    };

    const createBush = (x, z, scale = 1) => {
      const bushGroup = new THREE.Group();
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x2e8b2e, roughness: 0.85 });
      // Cluster of spheres
      [[0, 0, 0], [0.12, 0, 0.08], [-0.1, 0, 0.06], [0.05, 0.05, -0.05]].forEach(([bx, by, bz]) => {
        const sGeo = new THREE.SphereGeometry(0.15 * scale, 8, 8);
        const sphere = new THREE.Mesh(sGeo, bushMat);
        sphere.position.set(bx * scale, 0.12 * scale + by * scale, bz * scale);
        sphere.castShadow = true;
        bushGroup.add(sphere);
      });
      bushGroup.position.set(x, 0, z);
      return bushGroup;
    };

    // Place trees and bushes along the roadside
    scene.add(createTree(3.2, -1.5, 1.2));
    scene.add(createTree(3.5, 1.8, 0.9));
    scene.add(createTree(-3.0, 0.5, 1.0));
    scene.add(createTree(-3.5, -2.8, 1.3));
    scene.add(createTree(3.8, 4.0, 0.8));

    scene.add(createBush(2.5, 0.5, 1.0));
    scene.add(createBush(2.6, -0.8, 0.8));
    scene.add(createBush(-2.5, -1.5, 1.1));
    scene.add(createBush(-2.8, 2.0, 0.7));
    scene.add(createBush(2.4, 3.0, 0.9));
    scene.add(createBush(-2.6, -3.5, 0.8));

    // ═══ STREET LAMP ═══
    const createLamp = (x, z) => {
      const lampGroup = new THREE.Group();
      const lpGeo = new THREE.CylinderGeometry(0.025, 0.035, 2.2, 6);
      const lpMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.3 });
      const lp = new THREE.Mesh(lpGeo, lpMat);
      lp.position.y = 1.1;
      lampGroup.add(lp);

      // Lamp head
      const headGeo = new THREE.BoxGeometry(0.15, 0.04, 0.08);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xffee88, emissive: 0xffdd44, emissiveIntensity: 0.5,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 2.22, 0);
      lampGroup.add(head);

      // Glow
      const glowLight = new THREE.PointLight(0xffdd66, 0.5, 4);
      glowLight.position.set(0, 2.1, 0);
      lampGroup.add(glowLight);

      lampGroup.position.set(x, 0, z);
      return lampGroup;
    };

    scene.add(createLamp(2.3, 1));
    scene.add(createLamp(-2.3, -1));

    // ═══ BUILD THE CAR ═══
    const carGroup = new THREE.Group();

    // Brighter car color for visibility in dark mode
    const carColor = 0x4488cc;
    const carColorDark = 0x3366aa;

    // Body
    const bodyGeo = new THREE.BoxGeometry(2.4, 0.4, 1.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: carColor,
      roughness: 0.25,
      metalness: 0.7,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.35, 0);
    body.castShadow = true;
    carGroup.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.2, 0.45, 0.9);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: carColorDark,
      roughness: 0.2,
      metalness: 0.8,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.1, 0.72, 0);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(0.05, 0.35, 0.78);
    const windshieldMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
    });
    const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
    windshield.position.set(0.52, 0.68, 0);
    windshield.rotation.z = -0.2;
    carGroup.add(windshield);

    // Rear window
    const rearGeo = new THREE.BoxGeometry(0.05, 0.32, 0.75);
    const rearWindow = new THREE.Mesh(rearGeo, windshieldMat);
    rearWindow.position.set(-0.68, 0.65, 0);
    rearWindow.rotation.z = 0.15;
    carGroup.add(rearWindow);

    // Hood
    const hoodGeo = new THREE.BoxGeometry(0.5, 0.08, 0.95);
    const hoodMat = new THREE.MeshStandardMaterial({
      color: carColor,
      roughness: 0.2,
      metalness: 0.8,
    });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0.95, 0.50, 0);
    carGroup.add(hood);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.4 });
    const rimGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.13, 8);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 });

    const wheelPositions = [[0.7, 0.07, 0.55], [0.7, 0.07, -0.55], [-0.7, 0.07, 0.55], [-0.7, 0.07, -0.55]];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, y, z);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      carGroup.add(wheel);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(x, y, z);
      rim.rotation.x = Math.PI / 2;
      carGroup.add(rim);
    });

    // Headlights
    const headlightGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffcc, emissive: 0xffffaa, emissiveIntensity: 1,
    });
    [[1.2, 0.38, 0.3], [1.2, 0.38, -0.3]].forEach(([x, y, z]) => {
      const hl = new THREE.Mesh(headlightGeo, headlightMat);
      hl.position.set(x, y, z);
      carGroup.add(hl);
    });

    // Headlight glow
    const hlGlow = new THREE.SpotLight(0xfff5cc, 2, 6, Math.PI / 6, 0.5);
    hlGlow.position.set(1.3, 0.4, 0);
    hlGlow.target.position.set(4, 0, 0);
    carGroup.add(hlGlow);
    carGroup.add(hlGlow.target);

    // Taillights
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xff0000, emissive: 0xff2222, emissiveIntensity: 0.6,
    });
    [[-1.2, 0.38, 0.3], [-1.2, 0.38, -0.3]].forEach(([x, y, z]) => {
      const tl = new THREE.Mesh(headlightGeo, tailMat);
      tl.position.set(x, y, z);
      carGroup.add(tl);
    });

    scene.add(carGroup);

    // ═══ Hotspots ═══
    const hotspots = [];
    const hotspotGroup = new THREE.Group();
    CAR_PARTS.forEach((part) => {
      const geo = new THREE.SphereGeometry(0.15, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color),
        emissive: new THREE.Color(part.color),
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.4,
      });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.set(...part.position);
      sphere.userData = { partData: part };
      hotspotGroup.add(sphere);
      hotspots.push(sphere);
    });
    carGroup.add(hotspotGroup);
    hotspotMeshes.current = hotspots;

    // ═══ GSAP Entrance ═══
    carGroup.position.y = -2;
    carGroup.rotation.y = -Math.PI * 0.5;
    carGroup.scale.set(0, 0, 0);

    gsap.to(carGroup.position, { y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 });
    gsap.to(carGroup.rotation, { y: Math.PI * 0.25, duration: 1.8, ease: 'power2.out', delay: 0.2 });
    gsap.to(carGroup.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'back.out(1.4)', delay: 0.1 });

    // ═══ Raycaster ═══
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hotspots);

      if (intersects.length > 0) {
        const part = intersects[0].object.userData.partData;
        setTooltip(part);
        setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        renderer.domElement.style.cursor = 'pointer';
        hotspots.forEach((h) => {
          h.material.opacity = h === intersects[0].object ? 0.9 : 0.2;
          h.material.emissiveIntensity = h === intersects[0].object ? 1.2 : 0.3;
        });
      } else {
        setTooltip(null);
        renderer.domElement.style.cursor = 'grab';
        hotspots.forEach((h) => {
          h.material.opacity = 0.4;
          h.material.emissiveIntensity = 0.5;
        });
      }
    };

    const onMouseLeave = () => {
      setTooltip(null);
      hotspots.forEach((h) => {
        h.material.opacity = 0.4;
        h.material.emissiveIntensity = 0.5;
      });
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseleave', onMouseLeave);

    // ═══ Animation loop ═══
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      // Pulse hotspots
      const time = Date.now() * 0.003;
      hotspots.forEach((h, i) => {
        h.scale.setScalar(1 + Math.sin(time + i * 0.8) * 0.15);
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '500px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'grab',
        }}
      />

      {/* Hover Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltipPos.x + 16, (containerRef.current?.clientWidth || 600) - 280),
            top: Math.max(tooltipPos.y - 80, 10),
            background: 'rgba(10, 14, 26, 0.92)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${tooltip.color}40`,
            borderRadius: '12px',
            padding: '16px',
            width: '260px',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${tooltip.color}20`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>{tooltip.emoji}</span>
            <span style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem',
              color: tooltip.color,
            }}>
              {tooltip.name}
            </span>
          </div>
          <div style={{
            fontSize: '1.8rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800,
            color: getHealthColor(tooltip.key, params[tooltip.key] || 0),
            marginBottom: '4px',
          }}>
            {params[tooltip.key] ?? '—'} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#94a3b8' }}>{tooltip.unit}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>{tooltip.desc}</p>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '16px', padding: '8px 20px',
        background: 'rgba(10, 14, 26, 0.7)', backdropFilter: 'blur(10px)',
        borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '0.7rem', color: '#94a3b8',
      }}>
        <span>🖱️ Drag to rotate  •  Hover <span style={{ color: '#3b82f6' }}>●</span> dots to inspect</span>
      </div>
    </div>
  );
}
