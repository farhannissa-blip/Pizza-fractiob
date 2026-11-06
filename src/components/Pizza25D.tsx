import React, { useId } from 'react';
import { PizzaToppingId } from '../data/curriculum';
import { Fraction } from '../engine/fractionEngine';

interface SinglePizzaProps {
  totalSlices: number;
  activeSlices: number;
  selectedSliceIndices?: boolean[];
  onToggleSlice?: (sliceIndex: number) => void;
  topping: PizzaToppingId;
  size?: number;
  interactive?: boolean;
  liftActiveSlices?: boolean;
  showSliceNumbers?: boolean;
  modeHemat?: boolean;
  overlayGhostSlices?: { totalSlices: number; activeSlices: number } | null;
}

/**
 * Menghasilkan path SVG untuk satu juring (slice) lingkaran dari sudut startDeg ke endDeg
 */
function describeSlicePath(cx: number, cy: number, r: number, startAngleDeg: number, endAngleDeg: number): string {
  if (endAngleDeg - startAngleDeg >= 359.9) {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  }
  const startRad = ((startAngleDeg - 90) * Math.PI) / 180.0;
  const endRad = ((endAngleDeg - 90) * Math.PI) / 180.0;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngleDeg - startAngleDeg <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/**
 * Merender satu loyang Pizza 3D-Shaded Artisanal Mewah dengan papan saji kayu mahoni,
 * pinggiran roti bertekstur panggangan oven batu, lelehan keju berlapis kilau 3D,
 * daun basil segar, serta 6 variasi topping gourmet.
 */
export const SinglePizza25D: React.FC<SinglePizzaProps> = ({
  totalSlices,
  activeSlices,
  selectedSliceIndices,
  onToggleSlice,
  topping,
  size = 185,
  interactive = false,
  liftActiveSlices = true,
  showSliceNumbers = false,
  modeHemat = false,
  overlayGhostSlices = null,
}) => {
  const uid = useId().replace(/:/g, '');
  const safeDen = Math.max(1, Math.min(16, totalSlices));
  const angleStep = 360 / safeDen;
  const cx = 100;
  const cy = 95;
  const outerR = 82;
  const crustInnerR = 71;
  const sauceR = 70;
  const cheeseR = 66;

  const isSliceActive = (idx: number): boolean => {
    if (selectedSliceIndices && selectedSliceIndices.length === safeDen) {
      return selectedSliceIndices[idx];
    }
    return idx < activeSlices;
  };

  const renderGourmetToppings = (midAngleDeg: number, sliceIdx: number) => {
    const rad1 = ((midAngleDeg - 90) * Math.PI) / 180;
    const rad2 = ((midAngleDeg - 90 - angleStep * 0.22) * Math.PI) / 180;
    const rad3 = ((midAngleDeg - 90 + angleStep * 0.22) * Math.PI) / 180;
    const radBasil = ((midAngleDeg - 90 + angleStep * 0.08) * Math.PI) / 180;

    const p1 = { x: cx + 38 * Math.cos(rad1), y: cy + 38 * Math.sin(rad1) };
    const p2 = { x: cx + 53 * Math.cos(rad2), y: cy + 53 * Math.sin(rad2) };
    const p3 = { x: cx + 22 * Math.cos(rad3), y: cy + 22 * Math.sin(rad3) };
    const pBasil = { x: cx + 45 * Math.cos(radBasil), y: cy + 45 * Math.sin(radBasil) };

    const pts = safeDen <= 6 ? [p1, p2, p3] : [p1, p2];

    return (
      <g>
        {/* Bintik Keju Panggang Keemasan (Toasted Mozzarella Blisters) & Oregano */}
        <circle cx={p1.x - 6} cy={p1.y + 5} r={3.5} fill="#D97706" opacity={0.38} />
        <circle cx={p2.x + 4} cy={p2.y - 4} r={2.5} fill="#B45309" opacity={0.32} />
        <circle cx={p3.x} cy={p3.y - 3} r={0.9} fill="#15803D" opacity={0.75} />

        {/* Daun Basil Italia Segar di atas keju */}
        {safeDen <= 8 && (
          <g transform={`translate(${pBasil.x}, ${pBasil.y}) rotate(${midAngleDeg + 25})`}>
            <path d="M 0 -5 C 4 -4, 4 4, 0 5 C -4 4, -4 -4, 0 -5 Z" fill="#15803D" stroke="#14532D" strokeWidth={0.6} />
            <line x1={0} y1={-4} x2={0} y2={4} stroke="#86EFAC" strokeWidth={0.6} />
          </g>
        )}

        {pts.map((pt, i) => {
          const key = `top_${sliceIdx}_${i}`;
          switch (topping) {
            case 'pepperoni':
              return (
                <g key={key}>
                  {/* Bayangan 3D Pepperoni */}
                  <circle cx={pt.x + 1} cy={pt.y + 2} r={7.2} fill="rgba(69, 10, 10, 0.55)" />
                  {/* Daging Pepperoni Cembung Bergradasi */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={7}
                    fill={`url(#pepGrad_${uid})`}
                    stroke="#7F1D1D"
                    strokeWidth={1.3}
                  />
                  {/* Bintik Lemak & Kilau Minyak */}
                  <circle cx={pt.x - 2.2} cy={pt.y - 1.8} r={1.3} fill="#FECACA" opacity={0.9} />
                  <circle cx={pt.x + 2.4} cy={pt.y + 1.6} r={1.0} fill="#FEE2E2" opacity={0.85} />
                  <circle cx={pt.x - 1.2} cy={pt.y + 2.5} r={0.8} fill="#FECACA" opacity={0.8} />
                  <path
                    d={`M ${pt.x - 3.5} ${pt.y - 3} A 4 4 0 0 1 ${pt.x + 2} ${pt.y - 4}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={0.9}
                    opacity={0.55}
                    strokeLinecap="round"
                  />
                </g>
              );

            case 'mushroom':
              return (
                <g key={key} transform={`translate(${pt.x}, ${pt.y}) rotate(${i * 40 - 15})`}>
                  {/* Bayangan Jamur */}
                  <path d="M -6.5 1 A 6.5 5.5 0 0 1 6.5 1 Z" fill="rgba(28, 25, 23, 0.4)" />
                  {/* Payung Jamur Portobello 3D */}
                  <path d="M -6 0 A 6 5 0 0 1 6 0 Z" fill="#78716C" stroke="#44403C" strokeWidth={1.1} />
                  {/* Bilah Bawah Jamur */}
                  <line x1={-4.5} y1={-0.3} x2={4.5} y2={-0.3} stroke="#292524" strokeWidth={1.2} />
                  {/* Batang Jamur Creamy */}
                  <rect x={-2.2} y={0} width={4.4} height={5} rx={1.4} fill="#F5F5F4" stroke="#57534E" strokeWidth={0.9} />
                  {/* Highlight Payung */}
                  <path d="M -3.5 -2.5 Q 0 -4.2 3.5 -2.5" fill="none" stroke="#E7E5E4" strokeWidth={0.9} opacity={0.65} />
                </g>
              );

            case 'paprika':
              return (
                <g key={key} transform={`translate(${pt.x}, ${pt.y}) rotate(${sliceIdx * 35 + i * 25})`}>
                  {/* Paprika Hijau & Merah Panggang + Zaitun Hitam */}
                  <path
                    d="M -6 -2 Q 0 -7 6 -2 Q 4 4 -6 -2"
                    fill="none"
                    stroke="#15803D"
                    strokeWidth={3.4}
                    strokeLinecap="round"
                  />
                  <path
                    d="M -4 -2.5 Q 0 -5.5 4 -2.5"
                    fill="none"
                    stroke="#86EFAC"
                    strokeWidth={1}
                    strokeLinecap="round"
                  />
                  <circle cx={3.5} cy={2.5} r={3.2} fill="#1C1917" stroke="#09090B" strokeWidth={0.8} />
                  <circle cx={3.5} cy={2.5} r={1.2} fill="#FDE047" />
                </g>
              );

            case 'corn':
              return (
                <g key={key}>
                  {[
                    { dx: -2.8, dy: 0, r: 3.5 },
                    { dx: 3.2, dy: -2.2, r: 3.5 },
                    { dx: 1.0, dy: 3.6, r: 3.3 },
                  ].map((k, kIdx) => (
                    <g key={kIdx}>
                      <circle cx={pt.x + k.dx + 0.6} cy={pt.y + k.dy + 1} r={k.r} fill="rgba(113, 63, 18, 0.45)" />
                      <circle
                        cx={pt.x + k.dx}
                        cy={pt.y + k.dy}
                        r={k.r}
                        fill="#FACC15"
                        stroke="#CA8A04"
                        strokeWidth={0.9}
                      />
                      <circle cx={pt.x + k.dx - 1} cy={pt.y + k.dy - 1} r={1.1} fill="#FEF9C3" />
                    </g>
                  ))}
                </g>
              );

            case 'sausage':
              return (
                <g key={key}>
                  <circle cx={pt.x + 1} cy={pt.y + 1.8} r={6.8} fill="rgba(67, 20, 7, 0.5)" />
                  <circle cx={pt.x} cy={pt.y} r={6.6} fill="#9A3412" stroke="#431407" strokeWidth={1.3} />
                  <line x1={pt.x - 3.5} y1={pt.y - 2} x2={pt.x + 3.5} y2={pt.y - 2} stroke="#292524" strokeWidth={1.3} />
                  <line x1={pt.x - 3.5} y1={pt.y + 1.8} x2={pt.x + 3.5} y2={pt.y + 1.8} stroke="#292524" strokeWidth={1.3} />
                  <circle cx={pt.x - 1.5} cy={pt.y} r={0.9} fill="#FDE68A" />
                </g>
              );

            case 'extra_cheese':
            default:
              return (
                <g key={key}>
                  {/* Mozzarella Fior di Latte & Lelehan Cheddar Emas */}
                  <circle cx={pt.x} cy={pt.y + 1} r={6.5} fill="rgba(180, 83, 9, 0.35)" />
                  <circle cx={pt.x} cy={pt.y} r={6.2} fill="#FFFBEB" stroke="#FDE047" strokeWidth={1.3} />
                  <circle cx={pt.x - 1.8} cy={pt.y - 1.8} r={2} fill="#FFFFFF" />
                  <path
                    d={`M ${pt.x - 4.5} ${pt.y + 2} Q ${pt.x} ${pt.y + 6.5} ${pt.x + 4.5} ${pt.y + 1.5}`}
                    stroke="#F59E0B"
                    strokeWidth={1.8}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              );
          }
        })}
      </g>
    );
  };

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 208"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label={`Visualisasi Pizza Mewah ${activeSlices} dari ${safeDen} bagian`}
      >
        <defs>
          {/* Gradasi Papan Saji Kayu Mahoni */}
          <radialGradient id={`woodGrad_${uid}`} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="65%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </radialGradient>

          {/* Gradasi Pinggiran Roti Pizza (Golden Artisan Crust) */}
          <radialGradient id={`crustGrad_${uid}`} cx="48%" cy="45%" r="55%">
            <stop offset="72%" stopColor="#FBBF24" />
            <stop offset="88%" stopColor="#D97706" />
            <stop offset="96%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </radialGradient>

          {/* Gradasi Saus Tomat Italia */}
          <radialGradient id={`sauceGrad_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="85%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>

          {/* Gradasi Keju Mozzarella Meleleh Mewah */}
          <radialGradient id={`cheeseGrad_${uid}`} cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="55%" stopColor="#FDE047" />
            <stop offset="88%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#EAB308" />
          </radialGradient>

          {/* Gradasi Pepperoni 3D */}
          <radialGradient id={`pepGrad_${uid}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="65%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>
        </defs>

        {/* 1. Bayangan Dasar 3D di Bawah Talenan Kayu */}
        {!modeHemat && (
          <ellipse cx={cx} cy={cy + 16} rx={outerR + 9} ry={outerR * 0.95} fill="rgba(12, 10, 9, 0.48)" />
        )}

        {/* 2. Papan Saji Kayu Mahoni 3D dengan Pegangan Emas */}
        <ellipse cx={cx} cy={cy + 9} rx={outerR + 7} ry={outerR + 2} fill="#291002" />
        <circle
          cx={cx}
          cy={cy}
          r={outerR + 6}
          fill={`url(#woodGrad_${uid})`}
          stroke="#D97706"
          strokeWidth={2.2}
        />
        {/* Alur Lingkaran Papan Saji Kayu */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR - 4}
          fill="none"
          stroke="#451A03"
          strokeWidth={1.2}
          strokeDasharray="6 4"
          opacity={0.6}
        />

        {/* 3. Render Setiap Potongan (Slice) Pizza 3D */}
        {Array.from({ length: safeDen }).map((_, idx) => {
          const startDeg = idx * angleStep;
          const endDeg = (idx + 1) * angleStep;
          const midDeg = startDeg + angleStep / 2;
          const midRad = ((midDeg - 90) * Math.PI) / 180;
          const active = isSliceActive(idx);

          // Efek Angkat 3D: Potongan pizza aktif terangkat dengan bayangan jatuh di bawahnya
          const isLifted = active && liftActiveSlices && activeSlices < safeDen;
          const offsetDist = isLifted ? 6.5 : 0;
          const dx = offsetDist * Math.cos(midRad);
          const dy = offsetDist * Math.sin(midRad) - (isLifted ? 4 : 0);

          const outerPath = describeSlicePath(cx, cy, outerR, startDeg, endDeg);
          const crustInnerPath = describeSlicePath(cx, cy, crustInnerR, startDeg, endDeg);
          const saucePath = describeSlicePath(cx, cy, sauceR, startDeg, endDeg);
          const cheesePath = describeSlicePath(cx, cy, cheeseR, startDeg, endDeg);
          const depthPath = describeSlicePath(cx, cy + 7.5, outerR, startDeg, endDeg);

          // Bintik panggangan keemasan di pinggiran roti (crust blisters)
          const crustBlisterX = cx + (outerR - 5.5) * Math.cos(midRad);
          const crustBlisterY = cy + (outerR - 5.5) * Math.sin(midRad);

          // Posisi nomor potongan di pinggiran roti luar agar topping di atas keju terlihat sangat jelas
          const labelR = outerR - 4;
          const lx = cx + labelR * Math.cos(midRad);
          const ly = cy + labelR * Math.sin(midRad);

          return (
            <g
              key={`slice_${idx}`}
              onClick={() => interactive && onToggleSlice && onToggleSlice(idx)}
              className={
                interactive
                  ? 'cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-95'
                  : 'transition-transform duration-200'
              }
              style={{
                transform: `translate(${dx}px, ${dy}px)`,
              }}
            >
              {active ? (
                <>
                  {/* Bayangan Jatuh 3D Saat Potongan Pizza Diangkat */}
                  {isLifted && !modeHemat && (
                    <path d={depthPath} fill="rgba(0, 0, 0, 0.35)" transform="translate(0, 3)" />
                  )}

                  {/* Ketebalan Pinggiran Adonan Roti 3D (3D Extruded Crust Lip) */}
                  <path d={depthPath} fill="#92400E" stroke="#451A03" strokeWidth={1} />

                  {/* Pinggiran Roti Keemasan Berlapis Gradasi */}
                  <path
                    d={outerPath}
                    fill={`url(#crustGrad_${uid})`}
                    stroke="#78350F"
                    strokeWidth={1.6}
                  />

                  {/* Lekuk Dalam Pinggiran Roti */}
                  <path d={crustInnerPath} fill="none" stroke="#B45309" strokeWidth={1.2} opacity={0.7} />

                  {/* Efek Panggangan Oven Batu pada Pinggiran Roti */}
                  <circle cx={crustBlisterX} cy={crustBlisterY} r={2.6} fill="#78350F" opacity={0.55} />
                  <circle cx={crustBlisterX - 3} cy={crustBlisterY + 2} r={1.5} fill="#FEF3C7" opacity={0.45} />

                  {/* Lapisan Saus Tomat Italia */}
                  <path d={saucePath} fill={`url(#sauceGrad_${uid})`} />

                  {/* Lapisan Keju Mozzarella Meleleh */}
                  <path
                    d={cheesePath}
                    fill={`url(#cheeseGrad_${uid})`}
                    stroke="#F59E0B"
                    strokeWidth={1.1}
                  />

                  {/* Kilau Lelehan Keju Hangat */}
                  {!modeHemat && (
                    <ellipse
                      cx={cx + 28 * Math.cos(midRad)}
                      cy={cy + 28 * Math.sin(midRad)}
                      rx={5.5}
                      ry={3.2}
                      transform={`rotate(${midDeg}, ${cx + 28 * Math.cos(midRad)}, ${cy + 28 * Math.sin(midRad)})`}
                      fill="#FFFFFF"
                      opacity={0.48}
                    />
                  )}

                  {/* Topping Gourmet 3D */}
                  {renderGourmetToppings(midDeg, idx)}
                </>
              ) : (
                /* Slot Papan Saji Kosong dengan Remah Keju (Potongan Sudah Diambil) */
                <g>
                  <path
                    d={outerPath}
                    fill="rgba(254, 243, 199, 0.08)"
                    stroke="#D97706"
                    strokeWidth={1.3}
                    strokeDasharray="4 3"
                  />
                  <circle
                    cx={cx + 35 * Math.cos(midRad)}
                    cy={cy + 35 * Math.sin(midRad)}
                    r={1.5}
                    fill="#FDE68A"
                    opacity={0.4}
                  />
                </g>
              )}

              {/* Garis Pemotong Pecahan Presisi */}
              <path
                d={outerPath}
                fill="none"
                stroke={active ? '#451A03' : 'rgba(253, 224, 71, 0.35)'}
                strokeWidth={safeDen >= 10 ? 1.4 : 2.1}
              />

              {/* Nomor Potongan Pizza (Membantu Siswa Menghitung Pembilang & Penyebut) */}
              {showSliceNumbers && (
                <g transform={`translate(${lx}, ${ly})`}>
                  <circle
                    r={9.5}
                    fill={active ? '#451A03' : 'rgba(28, 25, 23, 0.72)'}
                    stroke="#FDE047"
                    strokeWidth={1.5}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FEF9C3"
                    fontSize={safeDen >= 10 ? '9' : '10.5'}
                    fontWeight="bold"
                  >
                    {idx + 1}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Overlay Transparan untuk Demonstrasi Pecahan Senilai */}
        {overlayGhostSlices && (
          <g className="pointer-events-none">
            {Array.from({ length: overlayGhostSlices.totalSlices }).map((_, gIdx) => {
              const gStep = 360 / overlayGhostSlices.totalSlices;
              const p = describeSlicePath(cx, cy, outerR, gIdx * gStep, (gIdx + 1) * gStep);
              const isGActive = gIdx < overlayGhostSlices.activeSlices;
              return (
                <path
                  key={`ghost_${gIdx}`}
                  d={p}
                  fill={isGActive ? 'rgba(59, 130, 246, 0.3)' : 'none'}
                  stroke="#1D4ED8"
                  strokeWidth={2.4}
                  strokeDasharray="5 3"
                />
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};

interface MultiPizzaFractionViewProps {
  fraction: Fraction;
  topping: PizzaToppingId;
  size?: number;
  showLabel?: boolean;
  modeHemat?: boolean;
}

/**
 * Merender Pecahan Biasa, Pecahan Tidak Wajar (Improper), maupun Pecahan Campuran
 * menjadi satu atau beberapa loyang Pizza 3D-Shaded Mewah secara otomatis & akurat.
 */
export const MultiPizzaFractionView: React.FC<MultiPizzaFractionViewProps> = ({
  fraction,
  topping,
  size = 140,
  showLabel = true,
  modeHemat = false,
}) => {
  const whole = fraction.whole ?? 0;
  const num = fraction.num;
  const den = Math.max(1, fraction.den);

  const pizzas: Array<{ total: number; active: number; caption: string }> = [];

  if (whole > 0) {
    for (let i = 0; i < Math.min(whole, 4); i++) {
      pizzas.push({ total: den, active: den, caption: '1 Utuh' });
    }
    if (num > 0) {
      pizzas.push({ total: den, active: num, caption: `${num}/${den}` });
    }
  } else if (num > den) {
    let remaining = num;
    let count = 0;
    while (remaining > 0 && count < 5) {
      const take = Math.min(remaining, den);
      pizzas.push({ total: den, active: take, caption: `${take}/${den}` });
      remaining -= take;
      count++;
    }
  } else {
    pizzas.push({ total: den, active: num, caption: `${num}/${den}` });
  }

  const adjustedSize =
    pizzas.length >= 3
      ? Math.round(size * 0.78)
      : pizzas.length === 2
      ? Math.round(size * 0.88)
      : size;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {pizzas.map((p, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <SinglePizza25D
            totalSlices={p.total}
            activeSlices={p.active}
            topping={topping}
            size={adjustedSize}
            modeHemat={modeHemat}
          />
          {showLabel && (
            <span className="mt-1 text-xs font-mono font-bold text-amber-950 bg-amber-100/95 px-2.5 py-0.5 rounded-md border border-amber-400 shadow-xs tabular-nums">
              {p.caption}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
