"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Floating copies of the world-map dumbbell, alternating sides, drifting
// down through the Classes → Pricing span as the page scrolls, spinning up on
// click. One shared canvas/renderer/scene keeps this to a single WebGL context
// instead of several, per the perf guidance (reuse resources, avoid redundant renderers).

interface Anchor {
  side: "left" | "right";
  rangeStart: number; // 0..1 progress through the tracked span where it starts drifting in
  rangeEnd: number;
  baseSize: number;
}

// Desktop only (see mobile check below) — 1-2 visible at a time.
const ANCHORS: Anchor[] = [
  { side: "left", rangeStart: 0.0, rangeEnd: 0.32, baseSize: 88 },
  { side: "right", rangeStart: 0.12, rangeEnd: 0.44, baseSize: 78 },
  { side: "left", rangeStart: 0.24, rangeEnd: 0.56, baseSize: 84 },
  { side: "right", rangeStart: 0.36, rangeEnd: 0.68, baseSize: 90 },
  { side: "left", rangeStart: 0.48, rangeEnd: 0.8, baseSize: 96 },
  { side: "right", rangeStart: 0.6, rangeEnd: 1.0, baseSize: 100 },
];

export function FloatingGlobes({ wrapperRef }: { wrapperRef: React.RefObject<HTMLDivElement | null> }) {
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const host = canvasHostRef.current;
    if (!wrapper || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The GLB is ~11MB and a second WebGL context is real weight — re-disabled
    // on mobile per client request to rule it out as the cause of a reported
    // startup stutter there. Desktop keeps it.
    if (window.innerWidth < 768) return;

    let rafId = 0;
    let disposed = false;
    let visible = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe6c520, 0.6);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    interface Instance {
      group: THREE.Group;
      anchor: Anchor;
      floatSeed: number;
      spinVelocity: number;
    }
    const instances: Instance[] = [];

    const loader = new GLTFLoader();
    loader.load(
      "/models/world-map-dumbbell.glb",
      (gltf) => {
        if (disposed) return;
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const normalizeScale = 1.05 / maxDim;

        ANCHORS.forEach((anchor, i) => {
          // Always clone (even for i===0): mutating gltf.scene's own position
          // directly would offset it before later clones copy that same position,
          // double-subtracting the center on every instance after the first.
          const model = gltf.scene.clone(true);
          model.position.sub(center);
          const group = new THREE.Group();
          group.add(model);
          group.scale.setScalar(normalizeScale);
          scene.add(group);
          instances.push({ group, anchor, floatSeed: Math.random() * Math.PI * 2, spinVelocity: 0.25 });
        });
      },
      undefined,
      (err) => console.warn("FloatingGlobes: failed to load model", err)
    );

    function progressForAnchor(scrollProgress: number, anchor: Anchor) {
      const span = anchor.rangeEnd - anchor.rangeStart;
      if (span <= 0) return 0;
      return Math.min(1, Math.max(0, (scrollProgress - anchor.rangeStart) / span));
    }

    let scrollProgress = 0;
    function computeScrollProgress() {
      const rect = wrapper!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        scrollProgress = 0;
        return;
      }
      scrollProgress = Math.min(1, Math.max(0, -rect.top / total));
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
    }

    const worldHalfHeightAt = (z: number) => {
      const dist = camera.position.z - z;
      return Math.tan((camera.fov * Math.PI) / 360) * dist;
    };

    function layout() {
      const halfH = worldHalfHeightAt(0);
      const halfW = halfH * camera.aspect;
      const t = performance.now() / 1000;

      instances.forEach((inst) => {
        const p = progressForAnchor(scrollProgress, inst.anchor);
        // Drift from just above the viewport down to just below it across its range.
        const y = halfH + 1.4 - p * (halfH * 2 + 2.8);
        const xEdge = halfW * 0.78;
        const x = inst.anchor.side === "left" ? -xEdge : xEdge;

        const bobX = Math.sin(t * 0.6 + inst.floatSeed) * 0.12;
        const bobY = Math.cos(t * 0.5 + inst.floatSeed) * 0.15;

        inst.group.position.set(x + bobX, y + bobY, 0);
        inst.group.rotation.y += inst.spinVelocity * (1 / 60);
        inst.group.rotation.x = Math.sin(t * 0.35 + inst.floatSeed) * 0.15;

        // Ease spin velocity back down toward its slow idle drift after a click burst.
        inst.spinVelocity += (0.25 - inst.spinVelocity) * 0.02;

        inst.group.visible = p > 0 && p < 1;
      });
    }

    function animate() {
      rafId = requestAnimationFrame(animate);
      computeScrollProgress();
      if (!visible) return;
      layout();
      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    // Click-to-spin: raycast against current instance screen positions. The canvas
    // itself is pointer-events:none so this never blocks clicks on real UI beneath —
    // we just listen on window and check whether the click landed near a globe.
    const raycaster = new THREE.Raycaster();
    function handleClick(e: MouseEvent) {
      if (!instances.length) return;
      const ndc = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(
        instances.map((i) => i.group),
        true
      );
      if (hits.length) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !instances.some((i) => i.group === obj)) obj = obj.parent;
        const inst = instances.find((i) => i.group === obj);
        if (inst) inst.spinVelocity = 8;
      }
    }
    window.addEventListener("click", handleClick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      renderer.dispose();
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
    };
  }, [wrapperRef]);

  return (
    <div
      ref={canvasHostRef}
      className="pointer-events-none fixed inset-0 z-[6]"
      aria-hidden="true"
    />
  );
}
