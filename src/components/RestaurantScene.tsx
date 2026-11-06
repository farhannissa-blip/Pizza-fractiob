import React from 'react';
import { CustomerProfile } from '../engine/questionGenerator';

export type CustomerMood = 'entering' | 'ordering' | 'happy' | 'sad';

interface CustomerCharacterProps {
  customer: CustomerProfile;
  mood: CustomerMood;
  modeHemat?: boolean;
}

export const CustomerCharacter: React.FC<CustomerCharacterProps> = ({
  customer,
  mood,
  modeHemat = false,
}) => {
  return (
    <div
      className={`relative flex items-center gap-3 transition-transform duration-300 ${
        !modeHemat && mood === 'ordering' ? 'animate-bob' : ''
      } ${mood === 'happy' ? 'scale-105' : ''}`}
    >
      {/* Avatar Karakter Pelanggan 2.5D */}
      <div
        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-900/40 shadow-md flex items-center justify-center shrink-0 overflow-hidden"
        style={{ backgroundColor: customer.avatarBg }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Bahu / Baju */}
          <path d="M 18 100 C 18 70, 82 70, 82 100 Z" fill={customer.shirtColor} />
          <path d="M 38 74 L 50 86 L 62 74" fill="#FFFFFF" opacity={0.85} />

          {/* Leher & Kepala */}
          <rect x="43" y="58" width="14" height="14" rx="4" fill="#FDBA74" />
          <circle cx="50" cy="44" r="21" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5" />

          {/* Rambut / Topi berdasarkan tipe pelanggan */}
          {customer.type === 'vip' ? (
            /* Mahkota VIP Emas */
            <path
              d="M 30 28 L 36 14 L 50 24 L 64 14 L 70 28 Z"
              fill="#FACC15"
              stroke="#CA8A04"
              strokeWidth="2"
            />
          ) : customer.type === 'special' ? (
            /* Topi Chef Juri */
            <path
              d="M 32 28 C 26 14, 42 10, 50 14 C 58 10, 74 14, 68 28 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          ) : customer.type === 'kid' ? (
            /* Topi Cap Anak Lucu */
            <g>
              <path d="M 29 34 A 21 16 0 0 1 71 34 Z" fill="#EF4444" />
              <path d="M 65 32 L 82 35 L 68 37 Z" fill="#B91C1C" />
            </g>
          ) : (
            /* Rambut Dewasa / Keluarga */
            <path d="M 28 40 C 28 20, 72 20, 72 40 C 65 28, 35 28, 28 40 Z" fill="#451A03" />
          )}

          {/* Mata sesuai ekspresi (Mood) */}
          {mood === 'happy' ? (
            <g stroke="#1C1917" strokeWidth="2.8" fill="none" strokeLinecap="round">
              <path d="M 37 42 Q 41 37 45 42" />
              <path d="M 55 42 Q 59 37 63 42" />
            </g>
          ) : mood === 'sad' ? (
            <g stroke="#1C1917" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <line x1="37" y1="39" x2="45" y2="43" />
              <line x1="63" y1="39" x2="55" y2="43" />
              <circle cx="41" cy="45" r="2" fill="#1C1917" />
              <circle cx="59" cy="45" r="2" fill="#1C1917" />
            </g>
          ) : (
            <g fill="#1C1917">
              <circle cx="41" cy="43" r="3" />
              <circle cx="59" cy="43" r="3" />
              <circle cx="42" cy="42" r="1" fill="#FFFFFF" />
              <circle cx="60" cy="42" r="1" fill="#FFFFFF" />
            </g>
          )}

          {/* Pipi Merona */}
          <circle cx="34" cy="49" r="3.5" fill="#FB7185" opacity={0.45} />
          <circle cx="66" cy="49" r="3.5" fill="#FB7185" opacity={0.45} />

          {/* Mulut sesuai ekspresi */}
          {mood === 'happy' ? (
            <path d="M 41 51 Q 50 61 59 51 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.2" />
          ) : mood === 'sad' ? (
            <path d="M 42 56 Q 50 49 58 56" fill="none" stroke="#7F1D1D" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <path d="M 43 52 Q 50 57 57 52" fill="none" stroke="#7F1D1D" strokeWidth="2.4" strokeLinecap="round" />
          )}
        </svg>

        {/* Indikator Ekspresi Kontras Tinggi (Bukan hanya warna) */}
        {mood === 'happy' && (
          <span className="absolute bottom-0.5 right-0.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
            PUAS!
          </span>
        )}
        {mood === 'sad' && (
          <span className="absolute bottom-0.5 right-0.5 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
            COBA LAGI
          </span>
        )}
      </div>

      {/* Nama & Peran Pelanggan */}
      <div className="min-w-0">
        <div className="text-xs font-semibold text-amber-800">
          {customer.roleLabel} · {mood === 'happy' ? 'Senang & Membayar' : mood === 'sad' ? 'Menunggu Perbaikan' : 'Memesan Pizza'}
        </div>
        <div className="text-base sm:text-lg font-display font-bold text-stone-900 truncate">
          {customer.name}
        </div>
      </div>
    </div>
  );
};

interface RestaurantBackdropProps {
  purchasedUpgrades: string[];
  modeHemat?: boolean;
  compact?: boolean;
}

/**
 * Ilustrasi Dapur & Restoran Pizza 2.5D Interaktif
 * Menampilkan Oven Menyala, Meja Adonan, Rak Topping, Kasir, Papan Menu,
 * Meja Pelanggan 2.5D, dan seluruh 11 Upgrade Restoran secara nyata!
 */
export const RestaurantStage25D: React.FC<RestaurantBackdropProps> = ({
  purchasedUpgrades,
  modeHemat = false,
  compact = false,
}) => {
  const hasWoodTable = purchasedUpgrades.includes('int_table_wood');
  const hasChandelier = purchasedUpgrades.includes('int_chandelier');
  const hasMarbleFloor = purchasedUpgrades.includes('int_marble_floor');
  const hasBrickOven = purchasedUpgrades.includes('kit_brick_oven');
  const hasGranitePrep = purchasedUpgrades.includes('kit_prep_counter');
  const hasToppingRack = purchasedUpgrades.includes('kit_topping_rack');
  const hasPlants = purchasedUpgrades.includes('dec_plants');
  const hasNeonSign = purchasedUpgrades.includes('dec_neon_sign');
  const hasExtraTables = purchasedUpgrades.includes('exp_extra_tables');
  const hasVipLounge = purchasedUpgrades.includes('exp_vip_lounge');
  const hasAcehBranch = purchasedUpgrades.includes('exp_aceh_branch');

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-amber-900/30 shadow-inner ${
        compact ? 'h-36 sm:h-44' : 'h-56 sm:h-64'
      }`}
    >
      <svg
        viewBox="0 0 900 260"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        role="img"
        aria-label="Interior Restoran dan Dapur Pizza 2.5D"
      >
        {/* 1. DINDING RESTORAN BERMOTIF KLASIK ITALIA, JENDELA, & PINTU MASUK */}
        <rect
          x="0"
          y="0"
          width="900"
          height="165"
          fill={hasMarbleFloor ? '#68200D' : '#852B0F'}
        />
        {/* Pola Bata & Ornamen Belah Ketupat (Dinding Bermotif) */}
        <g stroke={hasMarbleFloor ? '#D97706' : '#B45309'} strokeWidth="1.2" opacity="0.38">
          <line x1="0" y1="30" x2="900" y2="30" />
          <line x1="0" y1="60" x2="900" y2="60" />
          <line x1="0" y1="90" x2="900" y2="90" />
          <line x1="0" y1="120" x2="900" y2="120" />
          {Array.from({ length: 18 }).map((_, i) => (
            <polygon
              key={`motif_${i}`}
              points={`${i * 52 + 26},6 ${i * 52 + 36},16 ${i * 52 + 26},26 ${i * 52 + 16},16`}
              fill="#FDE047"
              opacity="0.35"
            />
          ))}
        </g>
        {/* Panel Kayu Wainscoting Bawah Dinding */}
        <rect x="0" y="128" width="900" height="37" fill="#451A03" stroke="#D97706" strokeWidth="2" />

        {/* JENDELA RESTORAN LENGKUNG (KIRI TENGAH & KANAN) */}
        {[152, 548].map((wx, idx) => (
          <g key={`win_${idx}`} transform={`translate(${wx}, 20)`}>
            <path
              d="M 0 98 L 0 28 A 24 24 0 0 1 48 28 L 48 98 Z"
              fill="#1E293B"
              stroke="#F59E0B"
              strokeWidth="3"
            />
            {/* Pemandangan Malam & Lampu Taman di Luar Jendela */}
            <circle cx="34" cy="28" r="6" fill="#FDE047" opacity="0.9" />
            <path d="M 4 96 Q 18 72 30 96 Z" fill="#15803D" opacity="0.8" />
            {/* Kisi-kisi Jendela Bermotif */}
            <line x1="24" y1="6" x2="24" y2="98" stroke="#F59E0B" strokeWidth="2" />
            <line x1="0" y1="54" x2="48" y2="54" stroke="#F59E0B" strokeWidth="2" />
            {/* Kanopi Merah-Putih di Atas Jendela */}
            <path d="M -4 12 L 52 12 L 56 24 L -8 24 Z" fill="#DC2626" stroke="#FEF2F2" strokeWidth="1.5" />
          </g>
        ))}

        {/* PINTU MASUK RESTORAN PIZZA (KANAN BELAKANG) */}
        <g transform="translate(808, 22)">
          {/* Bingkai Pintu Kayu Mahoni & Kaca Lengkung */}
          <path
            d="M 0 143 L 0 26 A 36 24 0 0 1 72 26 L 72 143 Z"
            fill="#5C2408"
            stroke="#FBBF24"
            strokeWidth="3"
          />
          {/* Kaca Pintu Bermotif Cahaya Hangat */}
          <path
            d="M 8 88 L 8 28 A 28 18 0 0 1 64 28 L 64 88 Z"
            fill="#0F172A"
            stroke="#D97706"
            strokeWidth="2"
          />
          <line x1="36" y1="10" x2="36" y2="143" stroke="#D97706" strokeWidth="2" />
          {/* Papan Tanda BUKA / OPEN di Pintu */}
          <rect x="18" y="52" width="36" height="15" rx="3" fill="#16A34A" stroke="#FEF08A" strokeWidth="1.2" />
          <text x="36" y="62" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">
            BUKA
          </text>
          {/* Gagang Pintu Emas */}
          <circle cx="29" cy="102" r="3" fill="#FACC15" />
          <circle cx="43" cy="102" r="3" fill="#FACC15" />
          {/* Keset Merah Selamat Datang */}
          <polygon points="-6,143 78,143 86,156 -14,156" fill="#B91C1C" stroke="#FDE047" strokeWidth="1.2" />
        </g>

        {/* 2. LANTAI PERSPEKTIF 2.5D */}
        <polygon
          points="0,165 900,165 900,260 0,260"
          fill={hasMarbleFloor ? '#FEF3C7' : '#FDE68A'}
        />
        {/* Garis Perspektif Lantai 2.5D */}
        <g stroke={hasMarbleFloor ? '#D97706' : '#B45309'} strokeWidth="1.5" opacity="0.35">
          <line x1="0" y1="190" x2="900" y2="190" />
          <line x1="0" y1="220" x2="900" y2="220" />
          <line x1="150" y1="165" x2="60" y2="260" />
          <line x1="300" y1="165" x2="240" y2="260" />
          <line x1="450" y1="165" x2="450" y2="260" />
          <line x1="600" y1="165" x2="660" y2="260" />
          <line x1="750" y1="165" x2="840" y2="260" />
        </g>

        {/* 3. DAPUR PIZZA & OVEN MENYALA (KIRI) */}
        <g transform="translate(12, 28)">
          {/* Kubah Oven 2.5D */}
          <path
            d="M 10 137 L 10 58 A 65 52 0 0 1 140 58 L 140 137 Z"
            fill={hasBrickOven ? '#D97706' : '#B91C1C'}
            stroke="#451A03"
            strokeWidth="3"
          />
          {hasBrickOven && (
            <path
              d="M 18 58 A 57 44 0 0 1 132 58"
              fill="none"
              stroke="#FEF08A"
              strokeWidth="3.5"
            />
          )}
          {/* Mulut Oven & Api Menyala */}
          <path d="M 32 137 L 32 82 A 43 34 0 0 1 118 82 L 118 137 Z" fill="#1C1917" />
          <g className="animate-flame">
            <path d="M 45 135 Q 58 92 72 135 Z" fill="#EA580C" />
            <path d="M 62 135 Q 76 86 90 135 Z" fill="#FACC15" />
            <path d="M 78 135 Q 92 96 105 135 Z" fill="#FB923C" />
          </g>
          {/* Pizza Sedang Dipanggang */}
          <ellipse cx="75" cy="130" rx="28" ry="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="36" y="34" width="78" height="16" rx="4" fill="#451A03" />
          <text x="75" y="45" textAnchor="middle" fill="#FEF08A" fontSize="9" fontWeight="bold">
            {hasBrickOven ? 'OVEN TURBO EMAS' : 'OVEN PIZZA'}
          </text>
        </g>

        {/* 4. PAPAN MENU RESTORAN & RAK TOPPING (TENGAH ATAS) */}
        <g transform="translate(195, 18)">
          {/* Papan Menu Restoran */}
          <rect x="0" y="0" width="155" height="62" rx="6" fill="#1C1917" stroke="#F59E0B" strokeWidth="3" />
          <text x="77" y="18" textAnchor="middle" fill="#FACC15" fontSize="11" fontWeight="bold">
            MENU SPESIAL PECAHAN
          </text>
          <text x="14" y="34" fill="#FDE68A" fontSize="9" fontFamily="monospace">
            1/2 Pepperoni ... $10
          </text>
          <text x="14" y="48" fill="#FDE68A" fontSize="9" fontFamily="monospace">
            3/4 Keju Ekstra . $15
          </text>

          {/* Rak Topping Pizza */}
          <g transform="translate(0, 72)">
            <rect
              x="0"
              y="0"
              width="155"
              height="42"
              rx="5"
              fill={hasToppingRack ? '#E2E8F0' : '#78350F'}
              stroke="#451A03"
              strokeWidth="2"
            />
            {/* Wadah-wadah Topping */}
            <circle cx="24" cy="21" r="11" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="52" cy="21" r="11" fill="#A8A29E" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="80" cy="21" r="11" fill="#15803D" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="108" cy="21" r="11" fill="#EAB308" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="134" cy="21" r="11" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
          </g>
        </g>

        {/* 5. LAMPU GANTUNG & PAPAN NEON / PLAKAT CABANG SDN 66 BANDA ACEH */}
        <g transform="translate(380, 6)">
          {/* Lampu Gantung */}
          <line x1="70" y1="0" x2="70" y2="22" stroke="#FDE047" strokeWidth="2.5" />
          {hasChandelier ? (
            <g>
              <path d="M 35 22 L 105 22 L 118 38 L 22 38 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
              <circle cx="42" cy="42" r="5" fill="#FEF9C3" />
              <circle cx="70" cy="44" r="6" fill="#FEF9C3" />
              <circle cx="98" cy="42" r="5" fill="#FEF9C3" />
            </g>
          ) : (
            <path d="M 48 22 L 92 22 L 102 36 L 38 36 Z" fill="#D97706" stroke="#451A03" strokeWidth="2" />
          )}

          {/* Papan Neon atau Plakat SDN 66 Banda Aceh */}
          <rect
            x="0"
            y="50"
            width="165"
            height="46"
            rx="8"
            fill={hasNeonSign ? '#3B0764' : '#451A03'}
            stroke={hasNeonSign ? '#F472B6' : '#F59E0B'}
            strokeWidth="2.5"
          />
          <text
            x="82"
            y="70"
            textAnchor="middle"
            fill="#FEF08A"
            fontSize="11"
            fontWeight="bold"
          >
            {hasAcehBranch ? '★ EMPIRE SDN 66 ★' : 'PIZZA FRACTION'}
          </text>
          <text
            x="82"
            y="86"
            textAnchor="middle"
            fill={hasNeonSign ? '#F472B6' : '#FDE68A'}
            fontSize="9"
            fontWeight="bold"
          >
            {hasAcehBranch ? 'CABANG BANDA ACEH' : 'SDN 66 BANDA ACEH'}
          </text>
        </g>

        {/* 6. MEJA PERSIAPAN ADONAN, AREA PENYAJIAN & MESIN KASIR (TENGAH BAWAH) */}
        <g transform="translate(185, 138)">
          {/* Body Meja Counter 2.5D */}
          <rect
            x="0"
            y="14"
            width="365"
            height="66"
            rx="4"
            fill={hasGranitePrep ? '#475569' : '#92400E'}
            stroke="#451A03"
            strokeWidth="2.5"
          />
          {/* Permukaan Atas Meja Counter */}
          <polygon
            points="-8,14 373,14 363,0 2,0"
            fill={hasGranitePrep ? '#F1F5F9' : '#FDE68A'}
            stroke="#451A03"
            strokeWidth="2"
          />
          {/* Adonan & Penggilas Adonan */}
          <ellipse cx="55" cy="7" rx="22" ry="5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.2" />
          {/* Area Penyajian Pizza */}
          <ellipse cx="175" cy="7" rx="30" ry="6" fill="#B91C1C" stroke="#FEF08A" strokeWidth="1.5" />
          {/* Mesin Kasir (Kanan Counter) */}
          <g transform="translate(295, -26)">
            <rect x="0" y="10" width="46" height="24" rx="3" fill="#EAB308" stroke="#451A03" strokeWidth="2" />
            <rect x="6" y="0" width="34" height="12" rx="2" fill="#1C1917" stroke="#CA8A04" strokeWidth="1.5" />
            <text x="23" y="9" textAnchor="middle" fill="#4ADE80" fontSize="8" fontFamily="monospace" fontWeight="bold">
              $$$
            </text>
          </g>
        </g>

        {/* 7. AREA MEJA PELANGGAN 2.5D & AREA VIP (KANAN) */}
        <g transform="translate(585, 118)">
          {/* Balkon / Karpet Area VIP jika sudah dibuka */}
          {hasVipLounge && (
            <g transform="translate(0, -85)">
              <rect x="10" y="0" width="270" height="72" rx="8" fill="#581C87" stroke="#FACC15" strokeWidth="2.5" />
              <text x="145" y="22" textAnchor="middle" fill="#FEF08A" fontSize="11" fontWeight="bold">
                ★ VIP LOUNGE RESTORAN ★
              </text>
              <rect x="40" y="34" width="80" height="26" rx="6" fill="#DC2626" stroke="#FACC15" strokeWidth="1.5" />
              <rect x="170" y="34" width="80" height="26" rx="6" fill="#DC2626" stroke="#FACC15" strokeWidth="1.5" />
            </g>
          )}

          {/* Meja Pelanggan Utama 2.5D */}
          <g transform="translate(15, 25)">
            {/* Kursi Kiri & Kanan */}
            <rect x="0" y="18" width="22" height="46" rx="4" fill={hasWoodTable ? '#78350F' : '#B45309'} stroke="#451A03" strokeWidth="2" />
            <rect x="108" y="18" width="22" height="46" rx="4" fill={hasWoodTable ? '#78350F' : '#B45309'} stroke="#451A03" strokeWidth="2" />
            {/* Kaki Meja */}
            <rect x="58" y="32" width="14" height="44" fill="#451A03" />
            {/* Daun Meja Perspektif 2.5D */}
            <ellipse
              cx="65"
              cy="28"
              rx="48"
              ry="16"
              fill={hasWoodTable ? '#DC2626' : '#F59E0B'}
              stroke="#451A03"
              strokeWidth="2.5"
            />
            {hasWoodTable && (
              <ellipse cx="65" cy="26" rx="38" ry="11" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="6 4" />
            )}
          </g>

          {/* Meja Tambahan jika Upgrade Pengembangan Restoran dibeli */}
          {hasExtraTables && (
            <g transform="translate(165, 35)">
              <rect x="0" y="16" width="20" height="42" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="2" />
              <rect x="96" y="16" width="20" height="42" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="2" />
              <rect x="52" y="28" width="12" height="40" fill="#451A03" />
              <ellipse cx="58" cy="24" rx="42" ry="14" fill="#DC2626" stroke="#451A03" strokeWidth="2.5" />
            </g>
          )}
        </g>

        {/* 8. TANAMAN BASIL & DEKORASI HIJAU */}
        {hasPlants && (
          <g>
            <g transform="translate(555, 118)">
              <rect x="0" y="28" width="24" height="26" rx="3" fill="#B45309" stroke="#451A03" strokeWidth="2" />
              <circle cx="12" cy="18" r="14" fill="#16A34A" />
              <circle cx="6" cy="12" r="9" fill="#22C55E" />
              <circle cx="18" cy="14" r="9" fill="#15803D" />
            </g>
            <g transform="translate(855, 122)">
              <rect x="0" y="28" width="24" height="26" rx="3" fill="#B45309" stroke="#451A03" strokeWidth="2" />
              <circle cx="12" cy="18" r="14" fill="#16A34A" />
              <circle cx="12" cy="10" r="10" fill="#22C55E" />
            </g>
          </g>
        )}
      </svg>

      {/* Badge Ringkasan Upgrade Aktif di Sudut Atas */}
      <div className="absolute top-2.5 right-3 bg-stone-950/80 text-amber-200 px-3 py-1 rounded-lg text-xs font-medium border border-amber-500/30">
        Restoran Level {1 + purchasedUpgrades.length} · {purchasedUpgrades.length}/11 Upgrade Aktif
      </div>
    </div>
  );
};
