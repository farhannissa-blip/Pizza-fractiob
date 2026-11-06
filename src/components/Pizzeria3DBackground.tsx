import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PizzaToppingId } from '../data/curriculum';
import { CustomerType } from '../engine/questionGenerator';

export interface Pizza3DTableSpec {
  totalSlices: number;
  activeSlices: number;
  selectedSliceIndices?: boolean[];
  label?: string;
}

export type Serving3DState =
  | 'preparing'
  | 'serving_success'
  | 'wrong_shake'
  | 'customer_angry_leave';

export type Camera3DPreset =
  | 'title'
  | 'form'
  | 'menu'
  | 'gameplay'
  | 'restaurant_tour'
  | 'tour_oven'
  | 'tour_vip'
  | 'tour_counter';

export interface Gameplay3DTableState {
  pizzas: Pizza3DTableSpec[];
  topping: PizzaToppingId;
  servingState: Serving3DState;
  customerType: CustomerType;
  interactiveSlices?: boolean;
  toppingBurstKey?: number;
  onToggle3DSlice?: (sliceIndex: number) => void;
}

interface Pizzeria3DBackgroundProps {
  purchasedUpgrades: string[];
  modeHemat?: boolean;
  cameraPreset?: Camera3DPreset;
  gameplayTableState?: Gameplay3DTableState | null;
  recentUpgradeKey?: number;
}

type CustomerAnimStyle =
  | 'counter_main'
  | 'vip_royal'
  | 'seated_eating'
  | 'seated_clapping'
  | 'seated_toast'
  | 'walking_door';

interface WaitingCustomerRig {
  group: THREE.Group;
  torsoMat: THREE.MeshStandardMaterial;
  head: THREE.Group;
  headMat: THREE.MeshStandardMaterial;
  hatGroup: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  orderBubble: THREE.Group;
  bubbleBgMat: THREE.MeshStandardMaterial;
  baseX: number;
  baseY: number;
  baseZ: number;
  baseRotY: number;
  phase: number;
  waitSpeed: number;
  animStyle: CustomerAnimStyle;
}

interface SliceAnimTarget {
  group: THREE.Group;
  midAngle: number;
  isActive: boolean;
  isLifted: boolean;
}

interface FallingToppingPiece {
  mesh: THREE.Mesh;
  baseX: number;
  baseZ: number;
  speed: number;
  phase: number;
}

/**
 * Membuat tekstur papan catur marmer prosedural untuk lantai restoran 3D
 */
function createCheckerFloorTexture(maxAnisotropy: number, isMarbleUpgrade: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const tileCount = 8;
  const size = canvas.width / tileCount;
  for (let y = 0; y < tileCount; y++) {
    for (let x = 0; x < tileCount; x++) {
      const isEven = (x + y) % 2 === 0;
      if (isMarbleUpgrade) {
        ctx.fillStyle = isEven ? '#FFFBEB' : '#57240B';
      } else {
        ctx.fillStyle = isEven ? '#FDE68A' : '#9A3412';
      }
      ctx.fillRect(x * size, y * size, size, size);
      ctx.strokeStyle = isMarbleUpgrade ? 'rgba(217,119,6,0.25)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * size, y * size, size, size);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 4);
  tex.anisotropy = Math.min(maxAnisotropy, 4);
  return tex;
}

/**
 * Membuat tekstur Dinding Restoran Bermotif Bata Klasik Italia, Ornamen Berlian Emas,
 * Lukisan Dinding Pizza, dan Panel Kayu Wainscoting
 */
function createDetailedRestaurantWallTexture(
  maxAnisotropy: number,
  isUpgraded: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Latar belakang dinding bata hangat
  ctx.fillStyle = isUpgraded ? '#5C1D0E' : '#732612';
  ctx.fillRect(0, 0, 512, 256);

  // Sabuk Wallpaper Bermotif Belah Ketupat Italia di Bagian Atas Dinding
  ctx.fillStyle = '#451A03';
  ctx.fillRect(0, 0, 512, 44);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(0, 42, 512, 4);
  for (let m = 0; m < 16; m++) {
    const cx = m * 32 + 16;
    const cy = 21;
    ctx.fillStyle = m % 2 === 0 ? '#FDE047' : '#DC2626';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 11);
    ctx.lineTo(cx + 11, cy);
    ctx.lineTo(cx, cy + 11);
    ctx.lineTo(cx - 11, cy);
    ctx.closePath();
    ctx.fill();
  }

  // Pola Bata Ekspos Klasik
  const rows = 7;
  const cols = 8;
  const startY = 48;
  const brickAreaH = 128;
  const bh = brickAreaH / rows;
  const bw = 512 / cols;
  ctx.strokeStyle = isUpgraded ? 'rgba(253, 224, 71, 0.22)' : 'rgba(255, 237, 213, 0.15)';
  ctx.lineWidth = 2;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (bw / 2);
    for (let c = -1; c <= cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#852D14' : '#6E220E';
      ctx.fillRect(c * bw + offset + 2, startY + r * bh + 2, bw - 4, bh - 4);
      ctx.strokeRect(c * bw + offset, startY + r * bh, bw, bh);
    }
  }

  // Bingkai Lukisan Ornamen Pizza di Dinding Bermotif
  [128, 384].forEach((px) => {
    ctx.fillStyle = '#291002';
    ctx.fillRect(px - 28, 72, 56, 46);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.strokeRect(px - 28, 72, 56, 46);
    // Ilustrasi Pizza di dalam Pigura Dinding
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(px, 95, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(px, 95, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(px - 3, 93, 3, 0, Math.PI * 2);
    ctx.arc(px + 4, 97, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Panel Kayu Wainscoting Bermotif di Bagian Bawah Dinding
  ctx.fillStyle = '#3E1606';
  ctx.fillRect(0, 176, 512, 80);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(0, 174, 512, 5);
  for (let p = 0; p < 8; p++) {
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 3;
    ctx.strokeRect(p * 64 + 8, 186, 48, 60);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(3, 1);
  tex.anisotropy = Math.min(maxAnisotropy, 4);
  return tex;
}

/**
 * Membuat tekstur Taplak Meja Makan Kotak-Kotak Merah-Putih Khas Restoran Pizza Italia
 */
function createCheckeredTableclothTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const cells = 8;
  const s = 128 / cells;
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#DC2626' : '#FEF2F2';
      ctx.fillRect(x * s, y * s, s, s);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = Math.min(maxAnisotropy, 4);
  return tex;
}

/**
 * Membuat tekstur permukaan keju mozzarella meleleh untuk bagian atas pizza 3D
 */
function createCheeseSurfaceTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, '#FEF9C3');
  grad.addColorStop(0.65, '#FDE047');
  grad.addColorStop(0.92, '#F59E0B');
  grad.addColorStop(1, '#DC2626');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  for (let i = 0; i < 14; i++) {
    const rx = ((i * 29) % 108) + 10;
    const ry = ((i * 41) % 108) + 10;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(180, 83, 9, 0.35)' : 'rgba(21, 128, 61, 0.55)';
    ctx.beginPath();
    ctx.arc(rx, ry, i % 3 === 0 ? 4 : 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(maxAnisotropy, 4);
  return tex;
}

function getToppingHexColor(topping: PizzaToppingId): number {
  switch (topping) {
    case 'pepperoni':
      return 0xdc2626;
    case 'mushroom':
      return 0x78716c;
    case 'paprika':
      return 0x16a34a;
    case 'corn':
      return 0xfacc15;
    case 'sausage':
      return 0x9a3412;
    case 'extra_cheese':
    default:
      return 0xfffbeb;
  }
}

/**
 * Membangun 3D Topping Gourmet yang berada TEPAT DI ATAS permukaan keju pizza (`y = 0.114` s/d `0.132`)
 * sehingga topping selalu tampak menonjol jelas di bagian atas pizza (tidak pernah tertutup adonan/terbalik!)
 */
function create3DToppingOnSlice(
  topping: PizzaToppingId,
  midAngle: number,
  sweepAngle: number,
  radiusScale: number
): THREE.Group {
  const group = new THREE.Group();

  // Tiga titik sebaran topping di atas permukaan keju per potongan pizza
  const spots = [
    { dist: 0.22 * radiusScale, angOff: 0 },
    { dist: 0.39 * radiusScale, angOff: -Math.min(0.14, sweepAngle * 0.22) },
    { dist: 0.41 * radiusScale, angOff: Math.min(0.14, sweepAngle * 0.22) },
  ];

  const mainColor = getToppingHexColor(topping);
  const mainMat = new THREE.MeshStandardMaterial({
    color: mainColor,
    roughness: topping === 'corn' || topping === 'extra_cheese' ? 0.22 : 0.38,
    metalness: 0.05,
  });

  // Permukaan atas keju berada di y = 0.098, maka semua topping diletakkan di y = 0.112 ke atas!
  const TOPPING_Y = 0.112;

  spots.forEach((sp, idx) => {
    const a = midAngle + sp.angOff;
    const tx = Math.sin(a) * sp.dist;
    const tz = Math.cos(a) * sp.dist;

    if (topping === 'pepperoni') {
      // Irisan Pepperoni Merah Cerah di Atas Keju
      const pep = new THREE.Mesh(
        new THREE.CylinderGeometry(0.062 * radiusScale, 0.064 * radiusScale, 0.022, 12),
        mainMat
      );
      pep.position.set(tx, TOPPING_Y, tz);
      group.add(pep);

      // Bintik Putih Lemak Pepperoni di Permukaan Atas Pepperoni
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xfecaca });
      const dot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.013 * radiusScale, 0.013 * radiusScale, 0.025, 8), dotMat);
      dot1.position.set(tx + 0.016 * radiusScale, TOPPING_Y + 0.002, tz + 0.012 * radiusScale);
      const dot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.011 * radiusScale, 0.011 * radiusScale, 0.025, 8), dotMat);
      dot2.position.set(tx - 0.018 * radiusScale, TOPPING_Y + 0.002, tz - 0.012 * radiusScale);
      group.add(dot1, dot2);
    } else if (topping === 'mushroom') {
      // Payung Jamur & Batang Putih di Atas Keju
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058 * radiusScale, 0.042 * radiusScale, 0.022, 12),
        mainMat
      );
      cap.position.set(tx, TOPPING_Y + 0.004, tz);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024 * radiusScale, 0.024 * radiusScale, 0.026, 8),
        new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.5 })
      );
      stem.position.set(tx, TOPPING_Y, tz);
      group.add(cap, stem);
    } else if (topping === 'paprika') {
      // Cincin Paprika Hijau & Zaitun Hitam di Atas Keju
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.048 * radiusScale, 0.014 * radiusScale, 8, 12),
        mainMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(tx, TOPPING_Y + 0.004, tz);
      group.add(ring);

      if (idx === 0) {
        const olive = new THREE.Mesh(
          new THREE.CylinderGeometry(0.028 * radiusScale, 0.028 * radiusScale, 0.024, 10),
          new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.3 })
        );
        olive.position.set(tx, TOPPING_Y + 0.002, tz);
        group.add(olive);
      }
    } else if (topping === 'corn') {
      // Kluster Biji Jagung Manis Kuning Emas di Atas Keju
      const offsets = [
        [-0.022, -0.018],
        [0.022, -0.015],
        [0.0, 0.022],
      ];
      offsets.forEach(([ox, oz]) => {
        const kernel = new THREE.Mesh(
          new THREE.SphereGeometry(0.028 * radiusScale, 8, 8),
          mainMat
        );
        kernel.position.set(tx + ox * radiusScale, TOPPING_Y + 0.005, tz + oz * radiusScale);
        group.add(kernel);
      });
    } else if (topping === 'sausage') {
      // Sosis Panggang Tebal di Atas Keju
      const saus = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058 * radiusScale, 0.058 * radiusScale, 0.026, 12),
        mainMat
      );
      saus.position.set(tx, TOPPING_Y + 0.003, tz);
      const grillMark = new THREE.Mesh(
        new THREE.BoxGeometry(0.075 * radiusScale, 0.028, 0.012 * radiusScale),
        new THREE.MeshBasicMaterial({ color: 0x291002 })
      );
      grillMark.position.set(tx, TOPPING_Y + 0.004, tz);
      group.add(saus, grillMark);
    } else {
      // Keju Mozzarella Fior di Latte Putih + Daun Basil Hijau di Atas Keju
      const pearl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.056 * radiusScale, 0.058 * radiusScale, 0.022, 12),
        mainMat
      );
      pearl.position.set(tx, TOPPING_Y + 0.002, tz);
      group.add(pearl);
    }
  });

  // Tambahkan Daun Basil Segar di Atas Keju pada Setiap Potongan
  const basilDist = 0.31 * radiusScale;
  const basilMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032 * radiusScale, 0.032 * radiusScale, 0.024, 8),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
  );
  basilMesh.scale.set(1.3, 1, 0.7);
  basilMesh.rotation.y = midAngle;
  basilMesh.position.set(
    Math.sin(midAngle) * basilDist,
    TOPPING_Y + 0.004,
    Math.cos(midAngle) * basilDist
  );
  group.add(basilMesh);

  return group;
}

/**
 * Membangun Loyang Pizza Pecahan 3D Interaktif di atas Papan Saji Kayu Mahoni 3D
 * Urutan vertikal dari bawah ke atas:
 * 1. Papan Kayu (y = 0.000 s/d 0.030)
 * 2. Roti Dasar Pizza (y = 0.032 s/d 0.068)
 * 3. Saus Tomat Merah di Atas Roti (y = 0.069 s/d 0.083)
 * 4. Keju Mozzarella Kuning Meleleh di Atas Saus (y = 0.084 s/d 0.098)
 * 5. Pinggiran Roti Gelembung HANYA di Tepi Luar (r = 0.91 * radius, y = 0.085)
 * 6. Topping Gourmet 3D di Paling Atas Keju (y = 0.112 s/d 0.132)
 */
function buildInteractive3DPizzaOnBoard(
  spec: Pizza3DTableSpec,
  topping: PizzaToppingId,
  pizzaIndex: number,
  totalPizzas: number,
  cheeseTex: THREE.CanvasTexture
): {
  boardGroup: THREE.Group;
  sliceTargets: SliceAnimTarget[];
  pickableMeshes: THREE.Object3D[];
} {
  const boardGroup = new THREE.Group();
  const radiusScale = totalPizzas >= 3 ? 0.72 : totalPizzas === 2 ? 0.86 : 1.08;
  const pizzaRadius = 0.62 * radiusScale;

  const spacing = totalPizzas >= 3 ? 1.05 : totalPizzas === 2 ? 1.32 : 0;
  const posX = (pizzaIndex - (totalPizzas - 1) / 2) * spacing;
  // Miringkan sedikit ke arah kamera pemain (rotation.x = 0.20) agar permukaan atas & topping terlihat sangat jelas!
  boardGroup.position.set(posX, 1.19, 0.18);
  boardGroup.rotation.x = 0.2;

  // 1. Papan Saji Kayu Mahoni 3D (Bagian Paling Bawah)
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x5c2408,
    roughness: 0.55,
    metalness: 0.08,
  });
  const boardDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(pizzaRadius + 0.08, pizzaRadius + 0.1, 0.03, 24),
    boardMat
  );
  boardDisc.position.y = 0.015;
  boardGroup.add(boardDisc);

  const safeDen = Math.max(1, Math.min(16, spec.totalSlices));
  const angleStep = (Math.PI * 2) / safeDen;
  const gapAngle = safeDen > 1 ? 0.038 : 0;

  const guideMat = new THREE.MeshBasicMaterial({ color: 0xfde68a });
  for (let i = 0; i < safeDen; i++) {
    const lineGeo = new THREE.BoxGeometry(0.012, 0.004, pizzaRadius * 1.92);
    const lineMesh = new THREE.Mesh(lineGeo, guideMat);
    lineMesh.position.y = 0.032;
    lineMesh.rotation.y = i * angleStep;
    boardGroup.add(lineMesh);
  }

  const crustMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.45,
    metalness: 0.05,
  });
  const sauceMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.38,
  });
  const cheeseMat = new THREE.MeshStandardMaterial({
    map: cheeseTex,
    roughness: 0.28,
    metalness: 0.06,
  });
  const ghostSlotMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    transparent: true,
    opacity: 0.18,
    roughness: 0.8,
  });

  const sliceTargets: SliceAnimTarget[] = [];
  const pickableMeshes: THREE.Object3D[] = [];

  for (let idx = 0; idx < safeDen; idx++) {
    const startAngle = idx * angleStep + gapAngle / 2;
    const sweepAngle = Math.max(0.05, angleStep - gapAngle);
    const midAngle = startAngle + sweepAngle / 2;

    const isActive =
      spec.selectedSliceIndices && spec.selectedSliceIndices.length === safeDen
        ? spec.selectedSliceIndices[idx]
        : idx < spec.activeSlices;

    const sliceGroup = new THREE.Group();
    sliceGroup.userData = { sliceIndex: idx };

    if (isActive) {
      // Lapisan 1 (Bawah): Adonan Roti Pizza (y = 0.032 s/d 0.068)
      const doughGeo = new THREE.CylinderGeometry(
        pizzaRadius,
        pizzaRadius * 0.96,
        0.036,
        12,
        1,
        false,
        startAngle,
        sweepAngle
      );
      const doughMesh = new THREE.Mesh(doughGeo, crustMat);
      doughMesh.position.y = 0.05;
      doughMesh.userData = { sliceIndex: idx };
      sliceGroup.add(doughMesh);
      pickableMeshes.push(doughMesh);

      // Lapisan 2 (Tengah): Saus Tomat Merah di Atas Roti (y = 0.068 s/d 0.082)
      const sauceGeo = new THREE.CylinderGeometry(
        pizzaRadius * 0.86,
        pizzaRadius * 0.86,
        0.016,
        10,
        1,
        false,
        startAngle,
        sweepAngle
      );
      const sauceMesh = new THREE.Mesh(sauceGeo, sauceMat);
      sauceMesh.position.y = 0.075;
      sauceMesh.userData = { sliceIndex: idx };
      sliceGroup.add(sauceMesh);

      // Lapisan 3 (Atas): Keju Mozzarella Kuning Meleleh di Atas Saus (y = 0.082 s/d 0.098)
      const cheeseGeo = new THREE.CylinderGeometry(
        pizzaRadius * 0.82,
        pizzaRadius * 0.82,
        0.018,
        10,
        1,
        false,
        startAngle,
        sweepAngle
      );
      const cheeseMesh = new THREE.Mesh(cheeseGeo, cheeseMat);
      cheeseMesh.position.y = 0.09;
      cheeseMesh.userData = { sliceIndex: idx };
      sliceGroup.add(cheeseMesh);
      pickableMeshes.push(cheeseMesh);

      // Pinggiran Roti Mengembang (HANYA di tepi luar r = 0.91 * pizzaRadius, tidak menutupi tengah keju!)
      const rimSteps = Math.max(2, Math.ceil(12 / safeDen));
      for (let rStep = 0; rStep < rimSteps; rStep++) {
        const frac = (rStep + 0.5) / rimSteps;
        const rimAngle = startAngle + sweepAngle * frac;
        const rimDist = pizzaRadius * 0.91;
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(0.048 * radiusScale, 8, 8),
          crustMat
        );
        puff.scale.set(1.2, 0.75, 1.2);
        puff.position.set(
          Math.sin(rimAngle) * rimDist,
          0.084,
          Math.cos(rimAngle) * rimDist
        );
        puff.userData = { sliceIndex: idx };
        sliceGroup.add(puff);
      }

      // Lapisan 4 (Paling Atas): Topping 3D Menonjol Jelas di Atas Keju (y = 0.112 s/d 0.132)
      const toppings3D = create3DToppingOnSlice(
        topping,
        midAngle,
        sweepAngle,
        radiusScale
      );
      sliceGroup.add(toppings3D);
    } else {
      const emptyGeo = new THREE.CylinderGeometry(
        pizzaRadius * 0.95,
        pizzaRadius * 0.95,
        0.02,
        10,
        1,
        false,
        startAngle,
        sweepAngle
      );
      const emptyMesh = new THREE.Mesh(emptyGeo, ghostSlotMat);
      emptyMesh.position.y = 0.042;
      emptyMesh.userData = { sliceIndex: idx };
      sliceGroup.add(emptyMesh);
      pickableMeshes.push(emptyMesh);
    }

    boardGroup.add(sliceGroup);
    sliceTargets.push({
      group: sliceGroup,
      midAngle,
      isActive,
      isLifted: isActive && spec.activeSlices < safeDen,
    });
  }

  return { boardGroup, sliceTargets, pickableMeshes };
}

/**
 * Membangun Karakter Pelanggan 3D Komposit dengan Topi Dinamis & Beragam Gaya Animasi
 */
function buildCustomer3D(
  shirtHex: number,
  hatType: 'cap' | 'crown' | 'chef' | 'hair',
  hatHex: number
): Omit<
  WaitingCustomerRig,
  'baseX' | 'baseY' | 'baseZ' | 'baseRotY' | 'phase' | 'waitSpeed' | 'animStyle'
> {
  const group = new THREE.Group();

  const torsoGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.95, 12);
  const torsoMat = new THREE.MeshStandardMaterial({
    color: shirtHex,
    roughness: 0.6,
    metalness: 0.08,
  });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 0.48;
  torso.castShadow = true;
  group.add(torso);

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.048, 8, 14),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.92;
  group.add(collar);

  const armGeo = new THREE.CapsuleGeometry(0.08, 0.42, 6, 10);
  const leftArm = new THREE.Mesh(armGeo, torsoMat);
  leftArm.position.set(-0.38, 0.68, 0.08);
  leftArm.rotation.z = 0.25;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, torsoMat);
  rightArm.position.set(0.38, 0.68, 0.08);
  rightArm.rotation.z = -0.25;
  group.add(rightArm);

  const head = new THREE.Group();
  head.position.y = 1.25;

  const headMat = new THREE.MeshStandardMaterial({
    color: 0xfed7aa,
    roughness: 0.52,
    metalness: 0.05,
  });
  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.29, 14, 14), headMat);
  head.add(headSphere);

  const eyeGeo = new THREE.SphereGeometry(0.042, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.2 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.1, 0.04, 0.25);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.1, 0.04, 0.25);
  head.add(leftEye, rightEye);

  const hatGroup = new THREE.Group();
  const hatMat = new THREE.MeshStandardMaterial({
    color: hatHex,
    roughness: hatType === 'crown' ? 0.22 : 0.65,
    metalness: hatType === 'crown' ? 0.85 : 0.1,
  });
  if (hatType === 'crown') {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.28, 6), hatMat);
    crown.position.y = 0.34;
    hatGroup.add(crown);
  } else if (hatType === 'chef') {
    const chefHat = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.34, 12), hatMat);
    chefHat.position.y = 0.35;
    hatGroup.add(chefHat);
  } else {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      hatMat
    );
    cap.position.y = 0.05;
    hatGroup.add(cap);
  }
  head.add(hatGroup);
  group.add(head);

  const orderBubble = new THREE.Group();
  orderBubble.position.set(0, 1.92, 0);

  const bubbleBgMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });
  const bubbleBg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.06, 16),
    bubbleBgMat
  );
  bubbleBg.rotation.x = Math.PI / 2;
  orderBubble.add(bubbleBg);

  const sliceIcon = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.24, 3),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
      roughness: 0.35,
    })
  );
  sliceIcon.rotation.z = Math.PI;
  sliceIcon.position.z = 0.04;
  orderBubble.add(sliceIcon);

  group.add(orderBubble);

  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 14),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.015;
  group.add(contactShadow);

  return {
    group,
    torsoMat,
    head,
    headMat,
    hatGroup,
    leftArm,
    rightArm,
    orderBubble,
    bubbleBgMat,
  };
}

/**
 * Membangun Jendela Lengkung Restoran Pizza 3D Lengkap dengan Pemandangan Malam,
 * Kisi-Kisi Jendela Bermotif, Kanopi Italia, dan Kotak Bunga
 */
function buildRestaurantWindow3D(x: number, y: number, z: number, rotY = 0): THREE.Group {
  const winGroup = new THREE.Group();
  winGroup.position.set(x, y, z);
  winGroup.rotation.y = rotY;

  // Bingkai Kayu Mahoni Jendela
  const outerFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.25, 2.55, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 })
  );
  winGroup.add(outerFrame);

  // Kaca Jendela Pemandangan Senja / Malam Kota
  const skyPane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.95, 2.25),
    new THREE.MeshBasicMaterial({ color: 0x1e293b })
  );
  skyPane.position.z = 0.08;
  winGroup.add(skyPane);

  // Lampu Taman / Bulan Bersinar di Luar Jendela
  const moonGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 14),
    new THREE.MeshBasicMaterial({ color: 0xfde047 })
  );
  moonGlow.position.set(0.42, 0.52, 0.09);
  winGroup.add(moonGlow);

  // Siluet Pohon Cemara Italia di Luar Jendela
  const tree1 = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 1.1, 8),
    new THREE.MeshBasicMaterial({ color: 0x14532d })
  );
  tree1.position.set(-0.45, -0.5, 0.09);
  winGroup.add(tree1);

  // Kisi-Kisi Jendela Emas Bermotif (Window Mullions)
  const barMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.3 });
  const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.25, 0.06), barMat);
  vBar.position.z = 0.1;
  const hBar1 = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.06, 0.06), barMat);
  hBar1.position.set(0, 0.25, 0.1);
  const hBar2 = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.06, 0.06), barMat);
  hBar2.position.set(0, -0.45, 0.1);
  winGroup.add(vBar, hBar1, hBar2);

  // Kanopi Garis Merah-Putih-Hijau Italia di Atas Jendela
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(2.38, 0.3, 0.48),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
  );
  awning.position.set(0, 1.25, 0.22);
  winGroup.add(awning);

  // Ambang Jendela & Pot Tanaman Basil di Bawah Jendela
  const sill = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.14, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
  );
  sill.position.set(0, -1.28, 0.12);
  winGroup.add(sill);

  return winGroup;
}

/**
 * Membangun Pintu Masuk Restoran Pizza 3D Lengkap dengan Kaca Lengkung,
 * Gagang Emas, Papan Tanda "BUKA / OPEN", Lonceng Pintu, dan Keset Merah
 */
function buildRestaurantEntranceDoor3D(x: number, z: number): THREE.Group {
  const doorGroup = new THREE.Group();
  doorGroup.position.set(x, 0, z);

  // Kusen Pintu Kayu Jati Besar
  const doorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 3.85, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x3e1606, roughness: 0.55 })
  );
  doorFrame.position.y = 1.925;
  doorGroup.add(doorFrame);

  // Daun Pintu Kayu Mahoni Kembar
  const doorPanel = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 3.6, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.48 })
  );
  doorPanel.position.y = 1.8;
  doorGroup.add(doorPanel);

  // Kaca Pintu Bercahaya Hangat
  const glassPane = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 1.85, 0.28),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.22,
      roughness: 0.2,
    })
  );
  glassPane.position.y = 2.35;
  doorGroup.add(glassPane);

  // Papan Hijau "BUKA / OPEN" di Tengah Kaca Pintu
  const openSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.36, 0.32),
    new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      emissive: 0x15803d,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    })
  );
  openSign.position.y = 2.35;
  doorGroup.add(openSign);

  // Gagang Pintu Kuningan Emas Kembar
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.9,
    roughness: 0.15,
  });
  [-0.14, 0.14].forEach((hx) => {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.38, 10), handleMat);
    handle.position.set(hx, 1.35, 0.18);
    doorGroup.add(handle);
  });

  // Kanopi Pintu Masuk Restoran
  const doorAwning = new THREE.Mesh(
    new THREE.BoxGeometry(2.55, 0.34, 0.65),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45 })
  );
  doorAwning.position.set(0, 3.85, 0.28);
  doorGroup.add(doorAwning);

  // Keset Selamat Datang di Depan Pintu
  const welcomeMat = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.025, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 })
  );
  welcomeMat.position.set(0, 0.015, 0.65);
  doorGroup.add(welcomeMat);

  return doorGroup;
}

/**
 * Membangun Meja Makan Restoran Pizza 3D Lengkap dengan Kursi Makan,
 * Taplak Kotak-Kotak Merah-Putih, Loyang Pizza di Meja, Gelas Minuman, & Lampu Meja
 */
function buildDiningTable3D(
  x: number,
  z: number,
  hasWoodUpgrade: boolean,
  clothTex: THREE.CanvasTexture
): THREE.Group {
  const tableGroup = new THREE.Group();
  tableGroup.position.set(x, 0, z);

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x292524,
    roughness: 0.4,
    metalness: 0.7,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.08, 14), baseMat);
  base.position.y = 0.04;
  tableGroup.add(base);

  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.85, 12), baseMat);
  leg.position.y = 0.45;
  tableGroup.add(leg);

  // Daun Meja Makan
  const topMat = new THREE.MeshStandardMaterial({
    color: hasWoodUpgrade ? 0xdc2626 : 0xb45309,
    roughness: 0.42,
    metalness: 0.1,
  });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.09, 20), topMat);
  top.position.y = 0.88;
  top.castShadow = true;
  top.receiveShadow = true;
  tableGroup.add(top);

  // Taplak Meja Bermotif Kotak-Kotak Merah Putih Khas Pizzeria Italia
  const clothDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.84, 0.86, 0.02, 20),
    new THREE.MeshStandardMaterial({
      map: clothTex,
      roughness: 0.6,
    })
  );
  clothDisc.position.y = 0.93;
  tableGroup.add(clothDisc);

  // Loyang Pizza Kecil & Topping di Atas Meja Makan Pelanggan
  const miniTray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.025, 14),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
  );
  miniTray.position.set(0, 0.955, 0);
  tableGroup.add(miniTray);

  const miniCheese = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.03, 14),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 })
  );
  miniCheese.position.set(0, 0.965, 0);
  tableGroup.add(miniCheese);

  // 2 Gelas Minuman Segar di Atas Meja Makan
  [-0.45, 0.45].forEach((cx) => {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.05, 0.16, 10),
      new THREE.MeshStandardMaterial({
        color: cx < 0 ? 0xf97316 : 0xef4444,
        roughness: 0.25,
      })
    );
    cup.position.set(cx, 1.01, 0.22);
    tableGroup.add(cup);
  });

  // 2 Kursi Makan Kayu Mahoni di Kiri & Kanan Meja Makan
  const chairWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5c2408,
    roughness: 0.55,
  });
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.5,
  });

  [-1.12, 1.12].forEach((chairX) => {
    const chair = new THREE.Group();
    chair.position.set(chairX, 0, 0);
    chair.rotation.y = chairX < 0 ? Math.PI / 2 : -Math.PI / 2;

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.52), cushionMat);
    seat.position.y = 0.48;
    chair.add(seat);

    const chairLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.46, 10),
      chairWoodMat
    );
    chairLeg.position.y = 0.23;
    chair.add(chairLeg);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.55, 0.07), chairWoodMat);
    backrest.position.set(0, 0.78, -0.23);
    chair.add(backrest);

    tableGroup.add(chair);
  });

  return tableGroup;
}

function buildOlivePlant3D(x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.24, 0.52, 12),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 })
  );
  pot.position.y = 0.26;
  g.add(pot);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.09, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0x5c2408, roughness: 0.8 })
  );
  trunk.position.y = 0.85;
  g.add(trunk);

  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
  const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), foliageMat);
  c1.position.set(0, 1.45, 0);
  const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), foliageMat);
  c2.position.set(0.22, 1.3, 0.14);
  const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), foliageMat);
  c3.position.set(-0.2, 1.32, -0.12);
  g.add(c1, c2, c3);

  return g;
}

export const Pizzeria3DBackground: React.FC<Pizzeria3DBackgroundProps> = ({
  purchasedUpgrades,
  modeHemat = false,
  cameraPreset = 'title',
  gameplayTableState = null,
  recentUpgradeKey = 0,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const presetRef = useRef<Camera3DPreset>(cameraPreset);
  presetRef.current = cameraPreset;

  const modeHematRef = useRef(modeHemat);
  modeHematRef.current = modeHemat;

  const gameplayStateRef = useRef<Gameplay3DTableState | null>(gameplayTableState);
  gameplayStateRef.current = gameplayTableState;

  const servingPlatterRootRef = useRef<THREE.Group | null>(null);
  const sliceAnimTargetsRef = useRef<SliceAnimTarget[]>([]);
  const pickableSliceMeshesRef = useRef<THREE.Object3D[]>([]);
  const cheeseTexRef = useRef<THREE.CanvasTexture | null>(null);
  const coins3DGroupRef = useRef<THREE.Group | null>(null);
  const toppingRainGroupRef = useRef<THREE.Group | null>(null);
  const fallingToppingsRef = useRef<FallingToppingPiece[]>([]);
  const toppingSprinkleTimerRef = useRef<number>(0);
  const upgradeHighlightPulseRef = useRef<number>(0);
  const customerRigsRef = useRef<WaitingCustomerRig[]>([]);

  // Trigger efek taburan topping 3D dari atas ke permukaan pizza
  useEffect(() => {
    toppingSprinkleTimerRef.current = 1.45;
    if (toppingRainGroupRef.current && gameplayTableState) {
      const hex = getToppingHexColor(gameplayTableState.topping);
      for (const item of fallingToppingsRef.current) {
        (item.mesh.material as THREE.MeshStandardMaterial).color.setHex(hex);
      }
    }
  }, [
    gameplayTableState?.topping,
    gameplayTableState?.toppingBurstKey,
    gameplayTableState?.pizzas,
    gameplayTableState?.servingState,
  ]);

  // Sesuaikan warna baju Pelanggan Utama #0 di depan meja saji sesuai tipe pelanggan soal aktif
  useEffect(() => {
    const mainCustomer = customerRigsRef.current[0];
    if (!mainCustomer || !gameplayTableState) return;
    const cType = gameplayTableState.customerType;
    if (cType === 'vip') {
      mainCustomer.torsoMat.color.setHex(0x9333ea);
    } else if (cType === 'special') {
      mainCustomer.torsoMat.color.setHex(0xdc2626);
    } else if (cType === 'family') {
      mainCustomer.torsoMat.color.setHex(0x16a34a);
    } else if (cType === 'adult') {
      mainCustomer.torsoMat.color.setHex(0xd97706);
    } else {
      mainCustomer.torsoMat.color.setHex(0x2563eb);
    }
  }, [gameplayTableState?.customerType]);

  useEffect(() => {
    if (recentUpgradeKey > 0) {
      upgradeHighlightPulseRef.current = 2.5;
    }
  }, [recentUpgradeKey, purchasedUpgrades.length]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl && !modeHematRef.current,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.setPixelRatio(
      isSoftwareGl || modeHematRef.current ? 1 : Math.min(window.devicePixelRatio, 1.4)
    );
    renderer.shadowMap.enabled = !isSoftwareGl && !modeHematRef.current;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x281107);
    scene.fog = new THREE.FogExp2(0x281107, 0.028);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      55
    );
    camera.position.set(0, 3.3, 7.8);
    camera.lookAt(0, 1.3, 0);

    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x3b180c, 0.98);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.75);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = !isSoftwareGl && !modeHematRef.current;
    keyLight.shadow.mapSize.set(512, 512);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 22;
    const d = 7.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    const ovenFireLight = new THREE.PointLight(0xff6b00, 3.0, 9);
    ovenFireLight.position.set(-3.2, 1.6, -2.2);
    scene.add(ovenFireLight);

    // Lampu Sorot Tepat di Atas Meja Saji agar Topping di Atas Pizza Berkilau Jelas
    const tableSpotLight = new THREE.PointLight(0xfff7ed, 2.5, 8);
    tableSpotLight.position.set(0, 3.4, 0.8);
    scene.add(tableSpotLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const hasWoodTable = purchasedUpgrades.includes('int_table_wood');
    const hasChandelier = purchasedUpgrades.includes('int_chandelier');
    const hasMarble = purchasedUpgrades.includes('int_marble_floor');
    const hasBrickOven = purchasedUpgrades.includes('kit_brick_oven');
    const hasGranitePrep = purchasedUpgrades.includes('kit_prep_counter');
    const hasToppingRack = purchasedUpgrades.includes('kit_topping_rack');
    const hasPlants = purchasedUpgrades.includes('dec_plants');
    const hasNeonSign = purchasedUpgrades.includes('dec_neon_sign');
    const hasExtraTables = purchasedUpgrades.includes('exp_extra_tables');
    const hasVipLounge = purchasedUpgrades.includes('exp_vip_lounge');
    const hasAcehBranch = purchasedUpgrades.includes('exp_aceh_branch');

    // 1. LANTAI RESTORAN 3D
    const floorTex = createCheckerFloorTexture(maxAniso, hasMarble);
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 18),
      new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: hasMarble ? 0.22 : 0.55,
        metalness: hasMarble ? 0.16 : 0.05,
      })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 2. DINDING RESTORAN BERMOTIF (Dinding Belakang & Dinding Samping Kiri-Kanan)
    const wallTex = createDetailedRestaurantWallTexture(maxAniso, hasMarble);
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.7,
      metalness: 0.06,
    });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 7.2, 0.4), wallMat);
    backWall.position.set(0, 3.6, -4.2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.2, 16), wallMat);
    leftWall.position.set(-9.2, 3.6, 2.0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.2, 16), wallMat);
    rightWall.position.set(9.2, 3.6, 2.0);
    scene.add(rightWall);

    // 3. JENDELA RESTORAN BERMOTIF & PINTU MASUK RESTORAN PIZZA 3D
    // Jendela Kiri Belakang & Jendela Tengah-Kanan
    const winBackLeft = buildRestaurantWindow3D(-5.8, 3.35, -3.95, 0);
    const winBackMidRight = buildRestaurantWindow3D(2.1, 3.35, -3.95, 0);
    // Jendela Dinding Samping Kiri
    const winSideLeft = buildRestaurantWindow3D(-8.95, 3.35, 0.5, Math.PI / 2);
    scene.add(winBackLeft, winBackMidRight, winSideLeft);

    // Pintu Masuk Restoran Pizza 3D Lengkap dengan Tanda BUKA & Keset Selamat Datang
    const entranceDoor = buildRestaurantEntranceDoor3D(5.5, -3.95);
    scene.add(entranceDoor);

    // 4. OVEN BATU API 3D KOMPOSIT
    const ovenGroup = new THREE.Group();
    ovenGroup.position.set(-3.5, 0, -2.8);

    const ovenBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.2, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.7 })
    );
    ovenBase.position.y = 0.6;
    ovenGroup.add(ovenBase);

    const ovenDome = new THREE.Mesh(
      new THREE.SphereGeometry(1.22, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: hasBrickOven ? 0xf59e0b : 0xb91c1c,
        roughness: hasBrickOven ? 0.22 : 0.65,
        metalness: hasBrickOven ? 0.8 : 0.1,
      })
    );
    ovenDome.position.y = 1.2;
    ovenGroup.add(ovenDome);

    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 1.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.5, metalness: 0.6 })
    );
    chimney.position.set(0, 2.7, -0.2);
    ovenGroup.add(chimney);

    const flamesGroup = new THREE.Group();
    flamesGroup.position.set(0, 1.25, 0.85);
    const flameColors = hasBrickOven ? [0x38bdf8, 0xfacc15, 0xff4500] : [0xff4500, 0xffa500, 0xfacc15];
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.22 - i * 0.03, 0.55 + i * 0.08, 10),
        new THREE.MeshBasicMaterial({ color: flameColors[i] })
      );
      cone.position.set((i - 1) * 0.24, 0.2, 0);
      flamesGroup.add(cone);
    }
    ovenGroup.add(flamesGroup);
    scene.add(ovenGroup);

    // 5. RAK TOPPING STAINLESS DELUXE 3D
    const toppingRackGroup = new THREE.Group();
    toppingRackGroup.position.set(3.4, 0, -2.6);

    const rackBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 1.8, 0.75),
      new THREE.MeshStandardMaterial({
        color: hasToppingRack ? 0xe2e8f0 : 0x57534e,
        roughness: hasToppingRack ? 0.22 : 0.6,
        metalness: hasToppingRack ? 0.8 : 0.2,
      })
    );
    rackBody.position.y = 0.9;
    toppingRackGroup.add(rackBody);

    const bowlColors = [0xdc2626, 0x78716c, 0x16a34a, 0xfacc15, 0x9a3412, 0xfffbeb];
    bowlColors.forEach((col, idx) => {
      const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.12, 0.14, 12),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 })
      );
      const row = Math.floor(idx / 3);
      const c = idx % 3;
      bowl.position.set((c - 1) * 0.48, 1.32 + row * 0.52, 0.2);
      toppingRackGroup.add(bowl);
    });
    scene.add(toppingRackGroup);

    // 6. MEJA SAJI UTAMA 3D (SERVING COUNTER) DI TENGAH PANGGUNG
    const counterGroup = new THREE.Group();
    counterGroup.position.set(0, 0, -0.2);

    const counterBody = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.05, 1.55),
      new THREE.MeshStandardMaterial({
        color: hasGranitePrep ? 0x1e293b : 0x78350f,
        roughness: 0.5,
        metalness: 0.15,
      })
    );
    counterBody.position.y = 0.525;
    counterBody.castShadow = true;
    counterBody.receiveShadow = true;
    counterGroup.add(counterBody);

    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.12, 1.75),
      new THREE.MeshStandardMaterial({
        color: hasGranitePrep ? 0xf8fafc : 0xfef3c7,
        roughness: hasGranitePrep ? 0.16 : 0.32,
        metalness: hasGranitePrep ? 0.2 : 0.1,
      })
    );
    counterTop.position.y = 1.1;
    counterTop.receiveShadow = true;
    counterGroup.add(counterTop);

    const runnerMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.5,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const tableRunner = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.015, 1.25), runnerMat);
    tableRunner.position.set(0, 1.165, 0.12);
    counterGroup.add(tableRunner);

    const cashRegister = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.42, 0.45),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.25,
        metalness: 0.85,
      })
    );
    cashRegister.position.set(2.05, 1.36, -0.35);
    counterGroup.add(cashRegister);

    // Grup Khusus Tempat Loyang-Loyang Pizza 3D Disajikan (Topping Menghadap Ke Atas!)
    const servingPlatterRoot = new THREE.Group();
    counterGroup.add(servingPlatterRoot);
    servingPlatterRootRef.current = servingPlatterRoot;

    // Grup Taburan Topping Pizza 3D Jatuh dari Atas ke Permukaan Pizza
    const toppingRainGroup = new THREE.Group();
    toppingRainGroup.position.set(0, 1.38, 0.18);
    toppingRainGroup.visible = false;
    const fallingPieces: FallingToppingPiece[] = [];
    for (let t = 0; t < 12; t++) {
      const angle = (t / 12) * Math.PI * 2;
      const dist = 0.14 + (t % 3) * 0.15;
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;
      const pieceMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.022, 10),
        new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          roughness: 0.3,
          metalness: 0.1,
        })
      );
      pieceMesh.position.set(bx, 0.45 + (t % 4) * 0.16, bz);
      toppingRainGroup.add(pieceMesh);
      fallingPieces.push({
        mesh: pieceMesh,
        baseX: bx,
        baseZ: bz,
        speed: 1.8 + (t % 3) * 0.45,
        phase: t * 0.5,
      });
    }
    counterGroup.add(toppingRainGroup);
    toppingRainGroupRef.current = toppingRainGroup;
    fallingToppingsRef.current = fallingPieces;

    // Grup Koin Emas 3D Melayang Saat Pesanan Disajikan
    const coins3DGroup = new THREE.Group();
    coins3DGroup.position.set(0, 1.5, 0);
    coins3DGroup.visible = false;
    for (let c = 0; c < 5; c++) {
      const coinMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.04, 14),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          metalness: 0.9,
          roughness: 0.15,
          emissive: 0xca8a04,
          emissiveIntensity: 0.3,
        })
      );
      coinMesh.rotation.x = Math.PI / 2;
      coinMesh.position.set((c - 2) * 0.38, (c % 2) * 0.18, 0);
      coins3DGroup.add(coinMesh);
    }
    counterGroup.add(coins3DGroup);
    coins3DGroupRef.current = coins3DGroup;

    scene.add(counterGroup);

    const cheeseTex = createCheeseSurfaceTexture(maxAniso);
    cheeseTexRef.current = cheeseTex;

    // 7. MEJA MAKAN PELANGGAN LENGKAP DENGAN KURSI, TAPLAK KOTAK-KOTAK, & PIZZA DI MEJA
    const clothTex = createCheckeredTableclothTexture(maxAniso);
    const table1 = buildDiningTable3D(-3.3, 1.65, hasWoodTable, clothTex);
    const table2 = buildDiningTable3D(3.3, 1.65, hasWoodTable, clothTex);
    const tableBackLeft = buildDiningTable3D(-5.8, -1.1, hasWoodTable, clothTex);
    scene.add(table1, table2, tableBackLeft);

    if (hasExtraTables) {
      const extraTableL = buildDiningTable3D(-5.8, 1.8, hasWoodTable, clothTex);
      const extraTableR = buildDiningTable3D(5.8, 1.8, hasWoodTable, clothTex);
      scene.add(extraTableL, extraTableR);
    }

    // 8. UPGRADE DEKORASI & PENGEMBANGAN RESTORAN 3D
    const animatedUpgradesGroup = new THREE.Group();
    scene.add(animatedUpgradesGroup);

    let chandelierRig: THREE.Group | null = null;
    if (hasChandelier) {
      chandelierRig = new THREE.Group();
      chandelierRig.position.set(0, 4.5, -0.5);

      const goldRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.06, 10, 24),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          metalness: 0.9,
          roughness: 0.15,
          emissive: 0xd97706,
          emissiveIntensity: 0.35,
        })
      );
      goldRing.rotation.x = Math.PI / 2;
      chandelierRig.add(goldRing);

      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2;
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.14, 0),
          new THREE.MeshStandardMaterial({
            color: 0xfffbeb,
            emissive: 0xfef08a,
            emissiveIntensity: 0.8,
            roughness: 0.1,
          })
        );
        crystal.position.set(Math.cos(ang) * 0.85, -0.18, Math.sin(ang) * 0.85);
        chandelierRig.add(crystal);
      }
      animatedUpgradesGroup.add(chandelierRig);
    }

    const plantRigs: THREE.Group[] = [];
    const pDefaultL = buildOlivePlant3D(-4.6, -2.8);
    const pDefaultR = buildOlivePlant3D(6.8, -2.8);
    plantRigs.push(pDefaultL, pDefaultR);
    animatedUpgradesGroup.add(pDefaultL, pDefaultR);

    if (hasPlants) {
      const p3 = buildOlivePlant3D(-4.8, 2.8);
      const p4 = buildOlivePlant3D(4.8, 2.8);
      plantRigs.push(p3, p4);
      animatedUpgradesGroup.add(p3, p4);
    }

    let neonSignMesh: THREE.Mesh | null = null;
    if (hasNeonSign) {
      const neonGroup = new THREE.Group();
      neonGroup.position.set(0, 4.9, -3.92);

      const neonBoard = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 0.85, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 })
      );
      neonGroup.add(neonBoard);

      neonSignMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.3, 0.62, 0.16),
        new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.9,
          roughness: 0.2,
        })
      );
      neonGroup.add(neonSignMesh);
      animatedUpgradesGroup.add(neonGroup);
    }

    if (hasVipLounge) {
      const vipCarpet = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.02, 3.6),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 })
      );
      vipCarpet.position.set(0, 0.012, -2.1);
      animatedUpgradesGroup.add(vipCarpet);

      [-1.35, 1.35].forEach((vx) => {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.07, 0.95, 10),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.15 })
        );
        post.position.set(vx, 0.48, -1.8);
        animatedUpgradesGroup.add(post);
      });
    }

    let acehStarMesh: THREE.Mesh | null = null;
    if (hasAcehBranch) {
      const acehGroup = new THREE.Group();
      acehGroup.position.set(-1.5, 3.4, -3.88);

      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 1.15, 0.15),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          metalness: 0.85,
          roughness: 0.2,
          emissive: 0xb45309,
          emissiveIntensity: 0.3,
        })
      );
      acehGroup.add(plaque);

      acehStarMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.34, 0),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          metalness: 0.95,
          roughness: 0.1,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.65,
        })
      );
      acehStarMesh.position.set(0, 0.85, 0.15);
      acehGroup.add(acehStarMesh);

      animatedUpgradesGroup.add(acehGroup);
    }

    // 9. ENAM PELANGGAN 3D DENGAN ANIMASI YANG BERBEDA-BEDA & HIDUP!
    const customerSpecs: Array<{
      x: number;
      y: number;
      z: number;
      rotY: number;
      shirt: number;
      hatType: 'cap' | 'crown' | 'chef' | 'hair';
      hatColor: number;
      animStyle: CustomerAnimStyle;
    }> = [
      // #0: Pelanggan Utama di Depan Meja Saji (Menunjuk pizza, mengangguk antusias, melompat saat puas, atau marah pergi!)
      {
        x: 0.0,
        y: 0,
        z: -1.45,
        rotY: 0,
        shirt: 0x2563eb,
        hatType: 'cap',
        hatColor: 0xef4444,
        animStyle: 'counter_main',
      },
      // #1: Sultan VIP di Area Karpet Merah (Melambai tangan kanan secara elegan & melihat jam tangan di tangan kiri)
      {
        x: 1.55,
        y: 0,
        z: -1.4,
        rotY: -0.3,
        shirt: 0x9333ea,
        hatType: 'crown',
        hatColor: 0xfacc15,
        animStyle: 'vip_royal',
      },
      // #2: Pelanggan Duduk di Meja Makan Kiri #1 (Sedang mengangkat potongan pizza ke mulut & makan dengan lahap)
      {
        x: -4.25,
        y: -0.12,
        z: 1.65,
        rotY: Math.PI / 2,
        shirt: 0x16a34a,
        hatType: 'hair',
        hatColor: 0x451a03,
        animStyle: 'seated_eating',
      },
      // #3: Pelanggan Duduk di Meja Makan Kiri #2 (Bertepuk tangan gembira & berbincang dengan keluarga)
      {
        x: -2.35,
        y: -0.12,
        z: 1.65,
        rotY: -Math.PI / 2,
        shirt: 0x0284c7,
        hatType: 'cap',
        hatColor: 0x38bdf8,
        animStyle: 'seated_clapping',
      },
      // #4: Pelanggan Duduk di Meja Makan Kanan (Mengangkat gelas minuman bersulang & bergoyang mengikuti musik)
      {
        x: 4.25,
        y: -0.12,
        z: 1.65,
        rotY: -Math.PI / 2,
        shirt: 0xdb2777,
        hatType: 'cap',
        hatColor: 0xf472b6,
        animStyle: 'seated_toast',
      },
      // #5: Pelanggan Berjalan Masuk dari Pintu Masuk Restoran Menuju Antrean Kasir!
      {
        x: 5.2,
        y: 0,
        z: -2.6,
        rotY: -0.6,
        shirt: 0xd97706,
        hatType: 'chef',
        hatColor: 0xffffff,
        animStyle: 'walking_door',
      },
    ];

    const customerRigs: WaitingCustomerRig[] = customerSpecs.map((spec, idx) => {
      const built = buildCustomer3D(spec.shirt, spec.hatType, spec.hatColor);
      built.group.position.set(spec.x, spec.y, spec.z);
      built.group.rotation.y = spec.rotY;
      scene.add(built.group);
      return {
        ...built,
        baseX: spec.x,
        baseY: spec.y,
        baseZ: spec.z,
        baseRotY: spec.rotY,
        phase: idx * 1.25,
        waitSpeed: 2.2 + idx * 0.3,
        animStyle: spec.animStyle,
      };
    });
    customerRigsRef.current = customerRigs;

    // Raycasting untuk Mengetuk Potongan Pizza 3D Langsung di Meja Saji
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (ev: PointerEvent) => {
      const gp = gameplayStateRef.current;
      if (!gp || !gp.interactiveSlices || !gp.onToggle3DSlice) return;
      if (pickableSliceMeshesRef.current.length === 0) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickableSliceMeshesRef.current, false);
      if (hits.length > 0) {
        const sliceIdx = hits[0].object.userData?.sliceIndex;
        if (typeof sliceIdx === 'number') {
          gp.onToggle3DSlice(sliceIdx);
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
      renderer.shadowMap.needsUpdate = true;
    }

    const _targetCamPos = new THREE.Vector3(0, 3.3, 7.8);
    const _targetLookAt = new THREE.Vector3(0, 1.3, 0);
    const _currentLookAt = new THREE.Vector3(0, 1.3, 0);

    const clock = new THREE.Clock();
    let frameId = 0;
    let isDisposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();

      const preset = presetRef.current;
      const gp = gameplayStateRef.current;

      // Kamera Dinamis & Fokus ke Permukaan Atas Pizza di Meja Saji
      if (preset === 'restaurant_tour') {
        _targetCamPos.set(
          Math.sin(elapsed * 0.45) * 4.2,
          3.5 + Math.sin(elapsed * 0.3) * 0.35,
          6.3 + Math.cos(elapsed * 0.45) * 1.1
        );
        _targetLookAt.set(Math.sin(elapsed * 0.25) * 1.0, 1.65, -1.3);
      } else if (preset === 'tour_oven') {
        _targetCamPos.set(-2.6, 2.5, 1.8);
        _targetLookAt.set(-3.4, 1.4, -2.6);
      } else if (preset === 'tour_vip') {
        _targetCamPos.set(1.2, 3.6, 4.9);
        _targetLookAt.set(1.2, 2.1, -3.4);
      } else if (preset === 'tour_counter') {
        _targetCamPos.set(0, 2.95, 2.8);
        _targetLookAt.set(0, 1.18, -0.2);
      } else if (preset === 'gameplay' && gp) {
        // Sudut pandang atas-depan meja saji agar permukaan atas pizza & topping terlihat jelas!
        _targetCamPos.set(0, 3.25, 2.65);
        _targetLookAt.set(0, 1.1, -0.25);
      } else if (preset === 'title') {
        _targetCamPos.set(Math.sin(elapsed * 0.25) * 0.9, 3.2, 5.4);
        _targetLookAt.set(0, 1.3, -0.5);
      } else if (preset === 'form') {
        _targetCamPos.set(-1.3, 2.95, 5.1);
        _targetLookAt.set(-0.2, 1.3, -0.5);
      } else {
        _targetCamPos.set(1.3, 3.2, 5.2);
        _targetLookAt.set(0.2, 1.25, -0.4);
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 3.8, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 3.8, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 3.8, dt);

      _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, 4.2, dt);
      _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, 4.2, dt);
      _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, 4.2, dt);
      camera.lookAt(_currentLookAt);

      // Animasi Penyajian Pizza 3D di Atas Meja Saji
      if (servingPlatterRootRef.current) {
        const platter = servingPlatterRootRef.current;
        if (gp?.servingState === 'serving_success') {
          platter.position.z = THREE.MathUtils.damp(platter.position.z, -0.55, 5.0, dt);
          platter.position.y = THREE.MathUtils.damp(platter.position.y, 0.08, 5.0, dt);
          platter.rotation.y += dt * 1.8;

          if (coins3DGroupRef.current) {
            coins3DGroupRef.current.visible = true;
            coins3DGroupRef.current.position.y = 1.55 + Math.abs(Math.sin(elapsed * 6)) * 0.35;
            coins3DGroupRef.current.rotation.y += dt * 3.5;
          }
        } else if (gp?.servingState === 'wrong_shake' || gp?.servingState === 'customer_angry_leave') {
          platter.position.x = Math.sin(elapsed * 28) * 0.08;
          platter.position.z = THREE.MathUtils.damp(platter.position.z, 0, 5.0, dt);
          if (coins3DGroupRef.current) coins3DGroupRef.current.visible = false;
        } else {
          platter.position.x = THREE.MathUtils.damp(platter.position.x, 0, 6.0, dt);
          platter.position.z = THREE.MathUtils.damp(platter.position.z, 0, 5.0, dt);
          platter.position.y = THREE.MathUtils.damp(platter.position.y, 0, 5.0, dt);
          platter.rotation.y = THREE.MathUtils.damp(platter.rotation.y, 0, 4.0, dt);
          if (coins3DGroupRef.current) coins3DGroupRef.current.visible = false;
        }
      }

      // Animasi Taburan Topping Pizza 3D Jatuh dari Atas ke Permukaan Pizza
      if (toppingRainGroupRef.current) {
        if (toppingSprinkleTimerRef.current > 0 || gp?.servingState === 'serving_success') {
          toppingSprinkleTimerRef.current = Math.max(0, toppingSprinkleTimerRef.current - dt);
          toppingRainGroupRef.current.visible = true;
          for (const piece of fallingToppingsRef.current) {
            const cycle = (elapsed * piece.speed + piece.phase) % 1.0;
            // Jatuh dari atas (y = 0.65) mendarat tepat di permukaan atas pizza (y = 0.08)
            piece.mesh.position.y = 0.08 + (1.0 - cycle) * 0.58;
            piece.mesh.rotation.x = elapsed * 3.2 + piece.phase;
            piece.mesh.rotation.z = elapsed * 2.2;
          }
        } else {
          toppingRainGroupRef.current.visible = false;
        }
      }

      // Animasi Potongan Pizza 3D Terangkat (Lift & Hover)
      for (const st of sliceAnimTargetsRef.current) {
        const targetLiftY = st.isLifted ? 0.068 + Math.sin(elapsed * 4) * 0.01 : 0;
        const targetRadial = st.isLifted ? 0.05 : 0;
        const tx = Math.sin(st.midAngle) * targetRadial;
        const tz = Math.cos(st.midAngle) * targetRadial;

        st.group.position.x = THREE.MathUtils.damp(st.group.position.x, tx, 7.0, dt);
        st.group.position.y = THREE.MathUtils.damp(st.group.position.y, targetLiftY, 7.0, dt);
        st.group.position.z = THREE.MathUtils.damp(st.group.position.z, tz, 7.0, dt);
      }

      if (upgradeHighlightPulseRef.current > 0) {
        upgradeHighlightPulseRef.current = Math.max(0, upgradeHighlightPulseRef.current - dt);
        const bounce = 1 + Math.sin(upgradeHighlightPulseRef.current * 8) * 0.06;
        animatedUpgradesGroup.scale.set(bounce, bounce, bounce);
      } else {
        animatedUpgradesGroup.scale.set(1, 1, 1);
      }

      if (!modeHematRef.current) {
        flamesGroup.scale.y = 1 + Math.sin(elapsed * 12) * 0.16;
        ovenFireLight.intensity = 3.0 + Math.sin(elapsed * 10) * 0.45;

        if (chandelierRig) {
          chandelierRig.rotation.y = elapsed * 0.45;
        }
        if (acehStarMesh) {
          acehStarMesh.rotation.y = elapsed * 1.4;
        }
        if (neonSignMesh) {
          const mat = neonSignMesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.75 + Math.sin(elapsed * 5) * 0.25;
        }
        for (let p = 0; p < plantRigs.length; p++) {
          plantRigs[p].rotation.z = Math.sin(elapsed * 1.8 + p) * 0.035;
        }

        // ANIMASI PELANGGAN 3D YANG BERBEDA-BEDA SESUAI PERAN & POSISI MEREKA!
        for (let i = 0; i < customerRigs.length; i++) {
          const rig = customerRigs[i];
          const t = elapsed * rig.waitSpeed + rig.phase;

          if (rig.animStyle === 'counter_main') {
            if (gp?.servingState === 'serving_success') {
              // Pelanggan Utama Melompat Gembira Menerima Pizza!
              rig.headMat.color.setHex(0xfed7aa);
              rig.bubbleBgMat.color.setHex(0x4ade80);
              rig.group.position.x = THREE.MathUtils.damp(rig.group.position.x, rig.baseX, 5.0, dt);
              rig.group.position.z = THREE.MathUtils.damp(rig.group.position.z, rig.baseZ, 5.0, dt);
              rig.group.rotation.y = THREE.MathUtils.damp(rig.group.rotation.y, rig.baseRotY, 5.0, dt);
              rig.group.position.y = Math.abs(Math.sin(elapsed * 9)) * 0.24;
              rig.leftArm.rotation.x = -2.5 + Math.sin(elapsed * 12) * 0.35;
              rig.rightArm.rotation.x = -2.5 - Math.sin(elapsed * 12) * 0.35;
              rig.head.rotation.y = Math.sin(elapsed * 6) * 0.22;
            } else if (gp?.servingState === 'customer_angry_leave') {
              // Waktu Habis: Pelanggan Marah, Berbalik Badan, & Berjalan Pergi Menuju Pintu!
              rig.headMat.color.setHex(0xef4444);
              rig.bubbleBgMat.color.setHex(0xef4444);
              rig.group.rotation.y = THREE.MathUtils.damp(rig.group.rotation.y, -Math.PI * 0.75, 6.0, dt);
              rig.group.position.x = THREE.MathUtils.damp(rig.group.position.x, 4.2, 1.8, dt);
              rig.group.position.z = THREE.MathUtils.damp(rig.group.position.z, -3.2, 1.8, dt);
              rig.group.position.y = Math.abs(Math.sin(elapsed * 14)) * 0.14;
              rig.leftArm.rotation.x = Math.sin(elapsed * 18) * 0.9;
              rig.rightArm.rotation.x = -Math.sin(elapsed * 18) * 0.9;
              rig.head.rotation.y = Math.sin(elapsed * 20) * 0.35;
            } else {
              // Menunggu Pesanan: Condong ke meja saji, tangan kanan menunjuk pizza, kepala mengangguk antusias
              rig.headMat.color.setHex(0xfed7aa);
              rig.bubbleBgMat.color.setHex(0xffffff);
              rig.group.position.x = THREE.MathUtils.damp(
                rig.group.position.x,
                rig.baseX + Math.sin(t * 0.6) * 0.08,
                4.5,
                dt
              );
              rig.group.position.z = THREE.MathUtils.damp(rig.group.position.z, rig.baseZ, 4.5, dt);
              rig.group.rotation.y = THREE.MathUtils.damp(rig.group.rotation.y, rig.baseRotY, 4.5, dt);
              rig.group.position.y = Math.abs(Math.sin(t * 1.2)) * 0.06;
              rig.head.rotation.x = Math.sin(t * 1.6) * 0.14 + 0.08;
              rig.head.rotation.y = Math.sin(t * 0.7) * 0.25;
              // Tangan kanan menunjuk ke arah loyang pizza di meja saji
              rig.rightArm.rotation.x = -1.1 + Math.sin(t * 2.0) * 0.25;
              rig.leftArm.rotation.x = Math.sin(t * 1.1) * 0.2;
            }
          } else if (rig.animStyle === 'vip_royal') {
            // Sultan VIP: Melambai elegan dengan tangan kanan & menengok jam tangan di tangan kiri
            rig.group.position.y = Math.abs(Math.sin(t * 0.8)) * 0.04;
            rig.rightArm.rotation.x = -2.1 + Math.sin(t * 3.0) * 0.35;
            rig.rightArm.rotation.z = -0.45 + Math.cos(t * 3.0) * 0.25;
            rig.leftArm.rotation.x = -0.8 + Math.sin(t * 0.9) * 0.15;
            rig.head.rotation.y = Math.sin(t * 0.6) * 0.35;
          } else if (rig.animStyle === 'seated_eating') {
            // Pelanggan di Meja Makan Kiri #1: Mengangkat potongan pizza ke mulut & mengunyah senang
            rig.group.position.y = rig.baseY;
            const eatCycle = Math.sin(t * 1.5);
            rig.rightArm.rotation.x = -1.45 - Math.max(0, eatCycle) * 0.65;
            rig.head.rotation.x = Math.max(0, eatCycle) * 0.22;
            rig.head.rotation.y = Math.sin(t * 0.5) * 0.15;
          } else if (rig.animStyle === 'seated_clapping') {
            // Pelanggan di Meja Makan Kiri #2: Bertepuk tangan gembira & mengobrol hangat
            rig.group.position.y = rig.baseY + Math.abs(Math.sin(t * 1.8)) * 0.03;
            rig.leftArm.rotation.x = -1.2;
            rig.rightArm.rotation.x = -1.2;
            rig.leftArm.rotation.z = 0.15 + Math.abs(Math.sin(t * 3.6)) * 0.35;
            rig.rightArm.rotation.z = -0.15 - Math.abs(Math.sin(t * 3.6)) * 0.35;
            rig.head.rotation.y = Math.sin(t * 1.2) * 0.28;
          } else if (rig.animStyle === 'seated_toast') {
            // Pelanggan di Meja Makan Kanan: Mengangkat gelas minuman bersulang & bergoyang ceria
            rig.group.position.y = rig.baseY;
            rig.group.rotation.z = Math.sin(t * 1.1) * 0.05;
            rig.rightArm.rotation.x = -1.9 + Math.sin(t * 2.2) * 0.3;
            rig.leftArm.rotation.x = -0.5;
            rig.head.rotation.y = Math.sin(t * 0.9) * 0.3;
          } else if (rig.animStyle === 'walking_door') {
            // Pelanggan #5: Berjalan dari Pintu Masuk Restoran menuju Meja Kasir lalu kembali dalam siklus hidup
            const walkProgress = (Math.sin(elapsed * 0.55) + 1) * 0.5; // 0..1
            rig.group.position.x = 5.3 - walkProgress * 2.6;
            rig.group.position.z = -3.3 + walkProgress * 1.7;
            rig.group.position.y = Math.abs(Math.sin(elapsed * 5.5)) * 0.08;
            rig.group.rotation.y = Math.cos(elapsed * 0.55) >= 0 ? -0.75 : 2.35;
            rig.leftArm.rotation.x = Math.sin(elapsed * 5.5) * 0.65;
            rig.rightArm.rotation.x = -Math.sin(elapsed * 5.5) * 0.65;
            rig.head.rotation.y = Math.sin(elapsed * 1.5) * 0.3;
          }

          rig.orderBubble.position.y = 1.92 + Math.sin(t * 1.8) * 0.05;
          rig.orderBubble.rotation.y = Math.sin(elapsed * 1.2 + rig.phase) * 0.35;
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      floorTex.dispose();
      wallTex.dispose();
      clothTex.dispose();
      cheeseTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [purchasedUpgrades]);

  // Sinkronisasi Loyang Pizza 3D di Meja Saji Setiap Kali Soal atau Pilihan Potongan Berubah
  useEffect(() => {
    const root = servingPlatterRootRef.current;
    const cheeseTex = cheeseTexRef.current;
    if (!root || !cheeseTex) return;

    while (root.children.length > 0) {
      const child = root.children[0];
      root.remove(child);
    }
    sliceAnimTargetsRef.current = [];
    pickableSliceMeshesRef.current = [];

    const specsToRender: Pizza3DTableSpec[] =
      gameplayTableState && gameplayTableState.pizzas.length > 0
        ? gameplayTableState.pizzas
        : [{ totalSlices: 8, activeSlices: 6 }];

    const topping: PizzaToppingId = gameplayTableState?.topping || 'pepperoni';

    specsToRender.forEach((spec, idx) => {
      const built = buildInteractive3DPizzaOnBoard(
        spec,
        topping,
        idx,
        specsToRender.length,
        cheeseTex
      );
      root.add(built.boardGroup);
      sliceAnimTargetsRef.current.push(...built.sliceTargets);
      if (idx === 0) {
        pickableSliceMeshesRef.current.push(...built.pickableMeshes);
      }
    });
  }, [gameplayTableState]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
