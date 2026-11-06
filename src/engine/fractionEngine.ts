/**
 * MESIN MATEMATIKA PECAHAN BILANGAN BULAT (EXACT INTEGER FRACTION ENGINE)
 * Pizza Fraction Frenzy — SDN 66 Banda Aceh
 *
 * Seluruh operasi pecahan menggunakan aritmatika bilangan bulat (integer)
 * untuk pembilang (num), penyebut (den), dan bilangan bulat (whole).
 * TIDAK menggunakan floating-point untuk pemeriksaan kesamaan atau hasil operasi.
 */

export interface Fraction {
  whole?: number; // Bilangan bulat untuk pecahan campuran (default 0)
  num: number;    // Pembilang (integer >= 0)
  den: number;    // Penyebut (integer > 0)
}

export interface MixedBorrowResult {
  original: Fraction;
  borrowedMixed: Fraction; // Contoh: 3 1/4 -> 2 5/4
  subtrahendCommon: Fraction;
   borrowedCommon: Fraction;
  resultImproper: Fraction;
  resultMixed: Fraction;
  lcm: number;
  neededBorrow: boolean;
  steps: string[];
}

export interface FractionOperationDetail {
  a: Fraction;
  b: Fraction;
  lcm: number;
  aConverted: Fraction;
  bConverted: Fraction;
  rawResult: Fraction;
  simplifiedResult: Fraction;
  mixedResult: Fraction;
  fpb: number;
  steps: string[];
}

export interface EngineTestCase {
  id: string;
  category: string;
  description: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

/**
 * Menghitung Faktor Persekutuan Terbesar (FPB / GCD) dengan Algoritma Euclidean
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

/**
 * Menghitung Kelipatan Persekutuan Terkecil (KPK / LCM)
 */
export function lcm(a: number, b: number): number {
  const x = Math.abs(Math.trunc(a));
  const y = Math.abs(Math.trunc(b));
  if (x === 0 || y === 0) return 1;
  return Math.trunc((x * y) / gcd(x, y));
}

/**
 * Mengubah Pecahan Campuran menjadi Pecahan Biasa (Metode GASING: (Bulat x Penyebut) + Pembilang)
 */
export function toImproper(f: Fraction): Fraction {
  const w = Math.trunc(f.whole ?? 0);
  const n = Math.trunc(f.num);
  const d = Math.max(1, Math.trunc(f.den));
  return {
    whole: 0,
    num: w * d + n,
    den: d,
  };
}

/**
 * Mengubah Pecahan Biasa (Improper) menjadi Pecahan Campuran
 * Contoh: 11/4 -> 11 div 4 = 2 sisa 3 -> 2 3/4
 */
export function toMixed(f: Fraction): Fraction {
  const imp = toImproper(f);
  const whole = Math.floor(imp.num / imp.den);
  const rem = imp.num % imp.den;
  if (rem === 0) {
    return { whole, num: 0, den: imp.den };
  }
  const divisor = gcd(rem, imp.den);
  return {
    whole,
    num: Math.trunc(rem / divisor),
    den: Math.trunc(imp.den / divisor),
  };
}

/**
 * Menyederhanakan pecahan ke bentuk paling sederhana menggunakan FPB
 */
export function simplify(f: Fraction): { simplified: Fraction; fpb: number } {
  const imp = toImproper(f);
  if (imp.num === 0) {
    return { simplified: { whole: 0, num: 0, den: 1 }, fpb: imp.den };
  }
  const divisor = gcd(imp.num, imp.den);
  const sNum = Math.trunc(imp.num / divisor);
  const sDen = Math.trunc(imp.den / divisor);

  // Jika input memiliki whole > 0, pertahankan format pecahan campuran yang disederhanakan
  if ((f.whole ?? 0) > 0) {
    const fpbPart = gcd(f.num, f.den);
    const partNum = Math.trunc(f.num / fpbPart);
    const partDen = Math.trunc(f.den / fpbPart);
    const extraWhole = Math.floor(partNum / partDen);
    const remNum = partNum % partDen;
    return {
      simplified: {
        whole: (f.whole ?? 0) + extraWhole,
        num: remNum,
        den: partDen,
      },
      fpb: fpbPart,
    };
  }

  return {
    simplified: {
      whole: 0,
      num: sNum,
      den: sDen,
    },
    fpb: divisor,
  };
}

/**
 * Memeriksa apakah dua pecahan bernilai SAMA (Pecahan Senilai)
 * Menggunakan perkalian silang bilangan bulat: a.num * b.den === b.num * a.den
 */
export function areEquivalent(a: Fraction, b: Fraction): boolean {
  const impA = toImproper(a);
  const impB = toImproper(b);
  return impA.num * impB.den === impB.num * impA.den;
}

/**
 * Memeriksa apakah dua pecahan SAMA PERSIS secara penulisan (strict match)
 * berguna untuk soal menyederhanakan pecahan atau konversi bentuk tertentu.
 */
export function isStrictEqual(a: Fraction, b: Fraction): boolean {
  const wA = a.whole ?? 0;
  const wB = b.whole ?? 0;
  return wA === wB && a.num === b.num && a.den === b.den;
}

/**
 * Membandingkan dua pecahan secara akurat tanpa floating-point.
 * Mengembalikan:
 *  -1 jika a < b
 *   0 jika a == b
 *   1 jika a > b
 */
export function compareFractions(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const impA = toImproper(a);
  const impB = toImproper(b);
  const left = impA.num * impB.den;
  const right = impB.num * impA.den;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

/**
 * Mengurutkan daftar pecahan
 */
export function sortFractions(list: Fraction[], ascending = true): Fraction[] {
  return [...list].sort((a, b) => {
    const cmp = compareFractions(a, b);
    return ascending ? cmp : -cmp;
  });
}

/**
 * Menjumlahkan dua pecahan (mendukung penyebut sama, berbeda, dan pecahan campuran)
 * dengan tahapan Singapore Math CPA & Metode GASING
 */
export function addFractions(a: Fraction, b: Fraction): FractionOperationDetail {
  const hasWhole = (a.whole ?? 0) > 0 || (b.whole ?? 0) > 0;
  const commonDen = lcm(a.den, b.den);
  const multA = Math.trunc(commonDen / a.den);
  const multB = Math.trunc(commonDen / b.den);

  if (hasWhole) {
    // Metode GASING untuk penjumlahan pecahan campuran:
    // 1. Pisahkan bilangan bulat dan pecahannya
    const wholeSum = (a.whole ?? 0) + (b.whole ?? 0);
    const convNumA = a.num * multA;
    const convNumB = b.num * multB;
    const sumNum = convNumA + convNumB;
    const extraWhole = Math.floor(sumNum / commonDen);
    const remNum = sumNum % commonDen;
    const fpb = remNum === 0 ? 1 : gcd(remNum, commonDen);
    const finalWhole = wholeSum + extraWhole;
    const finalNum = remNum === 0 ? 0 : Math.trunc(remNum / fpb);
    const finalDen = remNum === 0 ? commonDen : Math.trunc(commonDen / fpb);

    const steps: string[] = [
      `1. Pisahkan bilangan bulat dan pecahan: (${a.whole ?? 0} + ${b.whole ?? 0}) + (${a.num}/${a.den} + ${b.num}/${b.den})`,
      `2. Jumlahkan bilangan bulat: ${a.whole ?? 0} + ${b.whole ?? 0} = ${wholeSum}`,
      a.den === b.den
        ? `3. Penyebut pecahan sudah sama (${commonDen}), jumlahkan pembilang: ${a.num}/${commonDen} + ${b.num}/${commonDen} = ${sumNum}/${commonDen}`
        : `3. Samakan penyebut (${a.den} dan ${b.den}) menjadi ${commonDen}: ${convNumA}/${commonDen} + ${convNumB}/${commonDen} = ${sumNum}/${commonDen}`,
      `4. Gabungkan hasil menjadi: ${finalWhole}${finalNum > 0 ? ` ${finalNum}/${finalDen}` : ''}`,
    ];

    const impTotal = toImproper({ whole: finalWhole, num: finalNum, den: finalDen });

    return {
      a,
      b,
      lcm: commonDen,
      aConverted: { whole: a.whole ?? 0, num: convNumA, den: commonDen },
      bConverted: { whole: b.whole ?? 0, num: convNumB, den: commonDen },
      rawResult: { whole: wholeSum, num: sumNum, den: commonDen },
      simplifiedResult: impTotal,
      mixedResult: { whole: finalWhole, num: finalNum, den: finalDen },
      fpb,
      steps,
    };
  }

  // Pecahan biasa
  const convA: Fraction = { whole: 0, num: a.num * multA, den: commonDen };
  const convB: Fraction = { whole: 0, num: b.num * multB, den: commonDen };
  const rawResult: Fraction = { whole: 0, num: convA.num + convB.num, den: commonDen };
  const { simplified, fpb } = simplify(rawResult);
  const mixedResult = toMixed(simplified);

  const steps: string[] =
    a.den === b.den
      ? [
          `1. Penyebut kedua pizza sudah sama yaitu ${a.den} bagian.`,
          `2. Jumlahkan pembilangnya: ${a.num} + ${b.num} = ${rawResult.num}.`,
          `3. Hasil penjumlahan adalah ${rawResult.num}/${rawResult.den}${fpb > 1 ? ` (disederhanakan menjadi ${simplified.num}/${simplified.den})` : ''}.`,
        ]
      : [
          `1. Potongan pizza belum sama besar (1/${a.den} dan 1/${b.den}). Kita samakan penyebutnya menggunakan KPK = ${commonDen}.`,
          `2. Ubah menjadi pecahan senilai: ${a.num}/${a.den} = ${convA.num}/${commonDen} dan ${b.num}/${b.den} = ${convB.num}/${commonDen}.`,
          `3. Jumlahkan pembilang: ${convA.num}/${commonDen} + ${convB.num}/${commonDen} = ${rawResult.num}/${commonDen}${fpb > 1 ? ` = ${simplified.num}/${simplified.den}` : ''}.`,
        ];

  return {
    a,
    b,
    lcm: commonDen,
    aConverted: convA,
    bConverted: convB,
    rawResult,
    simplifiedResult: simplified,
    mixedResult,
    fpb,
    steps,
  };
}

/**
 * Mengurangkan Pecahan Campuran dengan Metode Peminjaman (Borrowing)
 * Contoh: 3 1/4 - 1 1/2
 * -> Samakan penyebut: 3 1/4 - 1 2/4
 * -> Karena 1/4 < 2/4, pinjam 1 pizza utuh (4/4): 3 1/4 menjadi 2 5/4
 * -> 2 5/4 - 1 2/4 = 1 3/4
 */
export function subtractMixedFractions(a: Fraction, b: Fraction): MixedBorrowResult {
  const commonDen = lcm(a.den, b.den);
  const multA = Math.trunc(commonDen / a.den);
  const multB = Math.trunc(commonDen / b.den);

  let wA = a.whole ?? 0;
  let nA = a.num * multA;
  const wB = b.whole ?? 0;
  const nB = b.num * multB;

  const steps: string[] = [];
  if (a.den !== b.den) {
    steps.push(
      `1. Samakan penyebut pecahan (${a.den} dan ${b.den}) menjadi ${commonDen}: ${wA} ${nA}/${commonDen} - ${wB} ${nB}/${commonDen}.`
    );
  } else {
    steps.push(`1. Penyebut pecahan sudah sama (${commonDen}): ${wA} ${nA}/${commonDen} - ${wB} ${nB}/${commonDen}.`);
  }

  let neededBorrow = false;
  if (nA < nB && wA > 0) {
    neededBorrow = true;
    wA -= 1;
    nA += commonDen;
    steps.push(
      `2. Karena ${nA - commonDen}/${commonDen} lebih kecil dari ${nB}/${commonDen}, pinjam 1 pizza utuh (${commonDen}/${commonDen}) sehingga menjadi ${wA} ${nA}/${commonDen}.`
    );
  } else {
    steps.push(`2. Bagian pecahan cukup dikurangkan langsung tanpa meminjam pizza utuh.`);
  }

  const diffWhole = wA - wB;
  const diffNum = nA - nB;
  const fpb = diffNum === 0 ? 1 : gcd(diffNum, commonDen);
  const sNum = diffNum === 0 ? 0 : Math.trunc(diffNum / fpb);
  const sDen = diffNum === 0 ? commonDen : Math.trunc(commonDen / fpb);

  steps.push(
    `3. Kurangkan bilangan bulat (${wA} - ${wB} = ${diffWhole}) dan pecahan (${nA}/${commonDen} - ${nB}/${commonDen} = ${diffNum}/${commonDen}).`,
    `4. Hasil akhir adalah ${diffWhole > 0 ? `${diffWhole} ` : ''}${sNum}/${sDen}.`
  );

  const resultMixed: Fraction = {
    whole: diffWhole,
    num: sNum,
    den: sDen,
  };

  return {
    original: a,
    borrowedMixed: { whole: wA, num: nA, den: commonDen },
    borrowedCommon: { whole: wA, num: nA, den: commonDen },
    subtrahendCommon: { whole: wB, num: nB, den: commonDen },
    resultImproper: toImproper(resultMixed),
    resultMixed,
    lcm: commonDen,
    neededBorrow,
    steps,
  };
}

/**
 * Format pecahan menjadi teks yang rapi
 */
export function formatFraction(f: Fraction): string {
  const w = f.whole ?? 0;
  if (w > 0 && f.num > 0) {
    return `${w} ${f.num}/${f.den}`;
  }
  if (w > 0 && f.num === 0) {
    return `${w}`;
  }
  return `${f.num}/${f.den}`;
}

/**
 * Membaca lambang pecahan dalam Bahasa Indonesia
 */
export function readFractionIndonesian(f: Fraction): string {
  const angka: Record<number, string> = {
    1: 'satu',
    2: 'dua',
    3: 'tiga',
    4: 'empat',
    5: 'lima',
    6: 'enam',
    7: 'tujuh',
    8: 'delapan',
    9: 'sembilan',
    10: 'sepuluh',
    11: 'sebelas',
    12: 'dua belas',
  };
  const w = f.whole ?? 0;
  const wText = w > 0 ? `${angka[w] || w} ` : '';
  if (f.num === 1 && f.den === 2) return `${wText}setengah (satu per dua)`;
  if (f.num === 1 && f.den === 3) return `${wText}sepertiga (satu per tiga)`;
  if (f.num === 1 && f.den === 4) return `${wText}seperempat (satu per empat)`;
  const nText = angka[f.num] || `${f.num}`;
  const dText = angka[f.den] || `${f.den}`;
  return `${wText}${nText} per ${dText}`;
}

/**
 * PENGUJIAN OTOMATIS (AUTOMATED TEST SUITE) UNTUK SELURUH 13 KATEGORI PECAHAN
 * Memastikan 100% ketepatan mesin matematika pecahan.
 */
export function runFractionEngineTests(): {
  allPassed: boolean;
  total: number;
  passedCount: number;
  results: EngineTestCase[];
} {
  const results: EngineTestCase[] = [];

  // 1. Pecahan Biasa & Kesamaan
  const t1 = areEquivalent({ num: 3, den: 4 }, { num: 3, den: 4 });
  results.push({
    id: 'KAT-01',
    category: '1. Konsep Pecahan',
    description: 'Representasi 3/4 memiliki pembilang 3 dan penyebut 4',
    input: '3/4',
    expected: '3/4 (Senilai = true)',
    actual: `${formatFraction({ num: 3, den: 4 })} (Senilai = ${t1})`,
    passed: t1 === true,
  });

  // 2. Pecahan Senilai
  const t2a = areEquivalent({ num: 1, den: 2 }, { num: 2, den: 4 });
  const t2b = areEquivalent({ num: 2, den: 4 }, { num: 4, den: 8 });
  results.push({
    id: 'KAT-02',
    category: '2. Pecahan Senilai',
    description: '1/2 = 2/4 = 4/8 menggunakan perkalian silang integer',
    input: '1/2, 2/4, 4/8',
    expected: 'true & true',
    actual: `${t2a} & ${t2b}`,
    passed: t2a && t2b,
  });

  // 3. Membandingkan Penyebut Sama
  const t3 = compareFractions({ num: 2, den: 5 }, { num: 4, den: 5 });
  results.push({
    id: 'KAT-03',
    category: '3. Bandingkan Penyebut Sama',
    description: '2/5 < 4/5 menghasilkan -1 (<)',
    input: '2/5 vs 4/5',
    expected: '-1 (2/5 < 4/5)',
    actual: `${t3} (2/5 < 4/5)`,
    passed: t3 === -1,
  });

  // 4. Membandingkan Penyebut Berbeda
  const t4 = compareFractions({ num: 1, den: 2 }, { num: 2, den: 3 });
  results.push({
    id: 'KAT-04',
    category: '4. Bandingkan Penyebut Berbeda',
    description: '1/2 vs 2/3 -> 3/6 < 4/6 menghasilkan -1 (<)',
    input: '1/2 vs 2/3',
    expected: '-1 (1/2 < 2/3)',
    actual: `${t4} (1/2 < 2/3)`,
    passed: t4 === -1,
  });

  // 5. Mengurutkan Pecahan
  const sorted = sortFractions(
    [
      { num: 3, den: 4 },
      { num: 1, den: 2 },
      { num: 2, den: 3 },
    ],
    true
  ).map(formatFraction);
  results.push({
    id: 'KAT-05',
    category: '5. Mengurutkan Pecahan',
    description: 'Urutkan 3/4, 1/2, 2/3 dari terkecil ke terbesar',
    input: '[3/4, 1/2, 2/3]',
    expected: '1/2, 2/3, 3/4',
    actual: sorted.join(', '),
    passed: sorted.join(', ') === '1/2, 2/3, 3/4',
  });

  // 6. Penjumlahan Penyebut Sama
  const addSame = addFractions({ num: 1, den: 5 }, { num: 2, den: 5 });
  results.push({
    id: 'KAT-06',
    category: '6. Penjumlahan Penyebut Sama',
    description: '1/5 + 2/5 = 3/5',
    input: '1/5 + 2/5',
    expected: '3/5',
    actual: formatFraction(addSame.simplifiedResult),
    passed: formatFraction(addSame.simplifiedResult) === '3/5',
  });

  // 7. Penjumlahan Penyebut Berbeda
  const addDiff = addFractions({ num: 1, den: 2 }, { num: 1, den: 4 });
  results.push({
    id: 'KAT-07',
    category: '7. Penjumlahan Penyebut Berbeda',
    description: '1/2 + 1/4 = 2/4 + 1/4 = 3/4',
    input: '1/2 + 1/4',
    expected: '3/4',
    actual: formatFraction(addDiff.simplifiedResult),
    passed: formatFraction(addDiff.simplifiedResult) === '3/4',
  });

  // 8. Konsep Pecahan Campuran
  const mixedConcept = formatFraction({ whole: 2, num: 1, den: 4 });
  results.push({
    id: 'KAT-08',
    category: '8. Konsep Pecahan Campuran',
    description: '2 pizza utuh dan 1/4 potong direpresentasikan sebagai 2 1/4',
    input: 'whole: 2, num: 1, den: 4',
    expected: '2 1/4',
    actual: mixedConcept,
    passed: mixedConcept === '2 1/4',
  });

  // 9. Mengubah Pecahan Biasa ke Campuran
  const convMixed = toMixed({ num: 11, den: 4 });
  results.push({
    id: 'KAT-09',
    category: '9. Pecahan Biasa ke Campuran',
    description: '11/4 = 11 ÷ 4 = 2 sisa 3 -> 2 3/4',
    input: '11/4',
    expected: '2 3/4',
    actual: formatFraction(convMixed),
    passed: formatFraction(convMixed) === '2 3/4',
  });

  // 10. Menyederhanakan Pecahan dengan FPB
  const simp = simplify({ num: 6, den: 8 });
  results.push({
    id: 'KAT-10',
    category: '10. Menyederhanakan Pecahan',
    description: '6/8 dibagi FPB(6,8)=2 menghasilkan 3/4',
    input: '6/8',
    expected: '3/4 (FPB 2)',
    actual: `${formatFraction(simp.simplified)} (FPB ${simp.fpb})`,
    passed: formatFraction(simp.simplified) === '3/4' && simp.fpb === 2,
  });

  // 11. Mengubah Pecahan Campuran ke Biasa (Metode GASING)
  const imp = toImproper({ whole: 2, num: 1, den: 3 });
  results.push({
    id: 'KAT-11',
    category: '11. Campuran ke Pecahan Biasa',
    description: '2 1/3 = (2 × 3 + 1)/3 = 7/3',
    input: '2 1/3',
    expected: '7/3',
    actual: formatFraction(imp),
    passed: formatFraction(imp) === '7/3',
  });

  // 12. Penjumlahan Pecahan Campuran
  const addMixed = addFractions({ whole: 1, num: 1, den: 2 }, { whole: 2, num: 1, den: 4 });
  results.push({
    id: 'KAT-12',
    category: '12. Penjumlahan Pecahan Campuran',
    description: '1 1/2 + 2 1/4 = (1+2) + (2/4 + 1/4) = 3 3/4',
    input: '1 1/2 + 2 1/4',
    expected: '3 3/4',
    actual: formatFraction(addMixed.mixedResult),
    passed: formatFraction(addMixed.mixedResult) === '3 3/4',
  });

  // 13. Pengurangan Pecahan Campuran dengan Peminjaman (Borrowing)
  const subMixed = subtractMixedFractions({ whole: 3, num: 1, den: 4 }, { whole: 1, num: 1, den: 2 });
  results.push({
    id: 'KAT-13',
    category: '13. Pengurangan Pecahan Campuran',
    description: '3 1/4 - 1 1/2 -> Pinjam 1 menjadi 2 5/4 - 1 2/4 = 1 3/4',
    input: '3 1/4 - 1 1/2',
    expected: '1 3/4 (Pinjam: 2 5/4)',
    actual: `${formatFraction(subMixed.resultMixed)} (Pinjam: ${formatFraction(subMixed.borrowedMixed)})`,
    passed:
      formatFraction(subMixed.resultMixed) === '1 3/4' &&
      formatFraction(subMixed.borrowedMixed) === '2 5/4' &&
      subMixed.neededBorrow === true,
  });

  const passedCount = results.filter((r) => r.passed).length;
  return {
    allPassed: passedCount === results.length,
    total: results.length,
    passedCount,
    results,
  };
}
