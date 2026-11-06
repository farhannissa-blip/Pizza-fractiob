/**
 * GENERATOR SOAL & PESANAN PELANGGAN DINAMIS (13 KATEGORI PECAHAN)
 * Pizza Fraction Frenzy — SDN 66 Banda Aceh
 */

import {
  Fraction,
  addFractions,
  areEquivalent,
  compareFractions,
  formatFraction,
  gcd,
  lcm,
  readFractionIndonesian,
  simplify,
  sortFractions,
  subtractMixedFractions,
  toImproper,
  toMixed,
} from './fractionEngine';
import { PizzaToppingId, TOPPINGS } from '../data/curriculum';

export type CustomerType = 'kid' | 'family' | 'adult' | 'vip' | 'special';

export interface CustomerProfile {
  type: CustomerType;
  name: string;
  roleLabel: string;
  avatarBg: string;
  shirtColor: string;
  hatColor?: string;
}

const CUSTOMER_POOL: CustomerProfile[] = [
  { type: 'kid', name: 'Rizky', roleLabel: 'Siswa Cilik', avatarBg: '#DBEAFE', shirtColor: '#2563EB' },
  { type: 'kid', name: 'Cut Putri', roleLabel: 'Pelanggan Anak', avatarBg: '#FCE7F3', shirtColor: '#DB2777' },
  { type: 'family', name: 'Keluarga Pak Teuku', roleLabel: 'Pesanan Keluarga', avatarBg: '#DCFCE7', shirtColor: '#16A34A' },
  { type: 'adult', name: 'Kak Nadia', roleLabel: 'Pelanggan Setia', avatarBg: '#FEF3C7', shirtColor: '#D97706' },
  { type: 'adult', name: 'Bang Farhan', roleLabel: 'Pecinta Pizza', avatarBg: '#E0E7FF', shirtColor: '#4F46E5' },
  { type: 'vip', name: 'Sultan Iskandar', roleLabel: 'Pelanggan VIP ★', avatarBg: '#FEF08A', shirtColor: '#9333EA', hatColor: '#EAB308' },
  { type: 'special', name: 'Chef Juri Kuliner', roleLabel: 'Pesanan Khusus', avatarBg: '#FFEDD5', shirtColor: '#DC2626', hatColor: '#FFFFFF' },
];

export type QuestionInteractionType =
  | 'SLICE_PICKER'      // Kategori 1: Memilih langsung potongan pada loyang pizza
  | 'MULTIPLE_CHOICE'   // Kategori 2, 6, 7, 8, 9, 10, 11, 12, 13: Pilihan kartu pizza visual + simbol
  | 'COMPARE_SYMBOL'    // Kategori 3 & 4: Memilih tanda <, =, atau >
  | 'ORDER_LIST';       // Kategori 5: Mengurutkan 3 pecahan (Terkecil->Terbesar atau Terbesar->Terkecil)

export interface DynamicQuestion {
  id: string;
  categoryId: number;
  categoryTitle: string;
  interactionType: QuestionInteractionType;
  customer: CustomerProfile;
  topping: PizzaToppingId;
  toppingName: string;
  secondTopping?: PizzaToppingId;
  dialogue: string;
  promptInstruction: string;
  // Visual pizzas to display in the question prompt
  promptFractions: Fraction[];
  // For SLICE_PICKER (Kategori 1)
  targetFraction: Fraction;
  // For COMPARE_SYMBOL (Kategori 3 & 4)
  correctCompareSymbol?: '<' | '=' | '>';
  showNumberLine?: boolean;
  // For ORDER_LIST (Kategori 5)
  orderAscending?: boolean;
  initialOrderFractions?: Fraction[];
  correctOrderedFractions?: Fraction[];
  // For MULTIPLE_CHOICE
  choices?: Fraction[];
  strictChoiceMatch?: boolean; // true untuk Kategori 9, 10, 11 (wajib bentuk paling sederhana / campuran / biasa)
  // Step-by-step CPA & GASING explanation shown after answering
  cpaExplanation: {
    concrete: string;
    pictorial: string;
    abstract: string;
    steps: string[];
  };
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Membuat 4 pilihan jawaban pecahan yang unik secara tampilan
 */
function buildChoices(correct: Fraction, distractors: Fraction[], strict = false): Fraction[] {
  const result: Fraction[] = [correct];
  for (const d of distractors) {
    if (d.num <= 0 || d.den <= 0) continue;
    const isDup = result.some((r) =>
      strict
        ? (r.whole ?? 0) === (d.whole ?? 0) && r.num === d.num && r.den === d.den
        : areEquivalent(r, d)
    );
    if (!isDup) {
      result.push(d);
    }
    if (result.length === 4) break;
  }

  let fallbackAdd = 1;
  while (result.length < 4) {
    const cand: Fraction = {
      whole: correct.whole ?? 0,
      num: Math.max(1, ((correct.num + fallbackAdd) % Math.max(2, correct.den + 2)) || 1),
      den: correct.den + (fallbackAdd > 3 ? 1 : 0),
    };
    const isDup = result.some((r) =>
      strict
        ? (r.whole ?? 0) === (cand.whole ?? 0) && r.num === cand.num && r.den === cand.den
        : areEquivalent(r, cand)
    );
    if (!isDup) {
      result.push(cand);
    }
    fallbackAdd++;
  }

  return shuffleArray(result);
}

export function generateQuestionForCategory(categoryId: number, levelDifficulty = 1): DynamicQuestion {
  const customer = randomItem(CUSTOMER_POOL);
  const toppingObj = randomItem(TOPPINGS);
  const secondToppingObj = randomItem(TOPPINGS.filter((t) => t.id !== toppingObj.id));
  const qId = `q_${categoryId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  switch (categoryId) {
    // =========================================================================
    // KATEGORI 1: MENGENAL KONSEP PECAHAN (SLICE PICKER)
    // =========================================================================
    case 1: {
      const allowedDens = levelDifficulty <= 1 ? [2, 3, 4, 6] : [3, 4, 5, 6, 8, 10, 12];
      const den = randomItem(allowedDens);
      const num = Math.floor(Math.random() * (den - 1)) + 1;
      const target: Fraction = { whole: 0, num, den };

      return {
        id: qId,
        categoryId: 1,
        categoryTitle: 'Mengenal Konsep Pecahan',
        interactionType: 'SLICE_PICKER',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        dialogue: `"Chef! Saya ingin memesan ${num}/${den} (${readFractionIndonesian(target)}) loyang pizza ${toppingObj.name}!"`,
        promptInstruction: `Ketuk langsung pada potongan pizza (atau tombol +/-) untuk mengambil tepat ${num} dari ${den} bagian pizza yang sama besar!`,
        promptFractions: [target],
        targetFraction: target,
        cpaExplanation: {
          concrete: `Pizza utuh dipotong menjadi ${den} bagian yang ukurannya sama besar.`,
          pictorial: `Kita mengambil ${num} potong pizza bertopping ${toppingObj.name}.`,
          abstract: `Lambang pecahannya adalah ${num}/${den}. Angka ${num} disebut Pembilang (bagian yang diambil) dan angka ${den} disebut Penyebut (seluruh bagian sama besar).`,
          steps: [
            `Penyebut = ${den} (menunjukkan jumlah seluruh potongan pizza yang sama besar).`,
            `Pembilang = ${num} (menunjukkan jumlah potongan pizza yang disajikan ke pelanggan).`,
            `Jadi bagian pizza yang dipilih adalah ${num}/${den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 2: PECAHAN SENILAI
    // =========================================================================
    case 2: {
      const basePairs: Array<[Fraction, Fraction]> = [
        [{ num: 1, den: 2 }, { num: 2, den: 4 }],
        [{ num: 1, den: 2 }, { num: 3, den: 6 }],
        [{ num: 1, den: 2 }, { num: 4, den: 8 }],
        [{ num: 1, den: 3 }, { num: 2, den: 6 }],
        [{ num: 2, den: 3 }, { num: 4, den: 6 }],
        [{ num: 1, den: 4 }, { num: 2, den: 8 }],
        [{ num: 3, den: 4 }, { num: 6, den: 8 }],
        [{ num: 2, den: 5 }, { num: 4, den: 10 }],
        [{ num: 3, den: 5 }, { num: 6, den: 10 }],
      ];
      const [base, equiv] = randomItem(basePairs);
      const mult = Math.trunc(equiv.den / base.den);
      const choices = buildChoices(equiv, [
        { num: equiv.num + 1, den: equiv.den },
        { num: Math.max(1, equiv.num - 1), den: equiv.den },
        { num: base.num, den: equiv.den },
        { num: equiv.num, den: Math.min(12, equiv.den + 2) },
      ]);

      return {
        id: qId,
        categoryId: 2,
        categoryTitle: 'Pecahan Senilai',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        dialogue: `"Chef! Saya biasa makan ${base.num}/${base.den} pizza ${toppingObj.name}. Kalau pizzanya dipotong menjadi ${equiv.den} bagian, berapa potong yang senilai?"`,
        promptInstruction: `Pilih pizza yang memiliki nilai PECAHAN SENILAI (luas bagian yang sama besar) dengan ${base.num}/${base.den}!`,
        promptFractions: [base],
        targetFraction: equiv,
        choices,
        cpaExplanation: {
          concrete: `Loyang pertama dibagi ${base.den} diambil ${base.num}. Loyang kedua dibagi ${equiv.den} diambil ${equiv.num}.`,
          pictorial: `Jika kedua pizza ditumpuk (overlay), luas bagian ${base.num}/${base.den} dan ${equiv.num}/${equiv.den} menutupi porsi yang SAMA PERSIS!`,
          abstract: `${base.num}/${base.den} = (${base.num} × ${mult}) / (${base.den} × ${mult}) = ${equiv.num}/${equiv.den}.`,
          steps: [
            `Pecahan awal adalah ${base.num}/${base.den}.`,
            `Kalikan pembilang dan penyebut dengan bilangan yang sama yaitu ${mult}.`,
            `(${base.num} × ${mult}) / (${base.den} × ${mult}) = ${equiv.num}/${equiv.den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 3: MEMBANDINGKAN PECAHAN PENYEBUT SAMA
    // =========================================================================
    case 3: {
      const den = randomItem([4, 5, 6, 8, 10]);
      const n1 = Math.floor(Math.random() * (den - 1)) + 1;
      let n2 = Math.floor(Math.random() * (den - 1)) + 1;
      if (Math.random() < 0.75 && n1 === n2) {
        n2 = n1 < den - 1 ? n1 + 1 : Math.max(1, n1 - 1);
      }
      const f1: Fraction = { num: n1, den };
      const f2: Fraction = { num: n2, den };
      const cmp = compareFractions(f1, f2);
      const sym: '<' | '=' | '>' = cmp === -1 ? '<' : cmp === 1 ? '>' : '=';

      return {
        id: qId,
        categoryId: 3,
        categoryTitle: 'Membandingkan Pecahan Penyebut Sama',
        interactionType: 'COMPARE_SYMBOL',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        secondTopping: secondToppingObj.id,
        dialogue: `"Chef, bantu kami membandingkan! Porsi ${n1}/${den} pizza ${toppingObj.name} itu lebih besar (>), lebih kecil (<), atau sama dengan (=) ${n2}/${den} pizza?"`,
        promptInstruction: `Bandingkan kedua pizza berpenyebut sama (${den}) di bawah ini dan pilih tanda yang tepat!`,
        promptFractions: [f1, f2],
        targetFraction: cmp >= 0 ? f1 : f2,
        correctCompareSymbol: sym,
        cpaExplanation: {
          concrete: `Kedua loyang pizza sama-sama dipotong menjadi ${den} bagian sama besar.`,
          pictorial: `Pizza kiri berisi ${n1} potong (${n1}/${den}) dan pizza kanan berisi ${n2} potong (${n2}/${den}).`,
          abstract: `Karena penyebutnya sudah sama (${den}), bandingkan pembilangnya: ${n1} ${sym} ${n2}, maka ${n1}/${den} ${sym} ${n2}/${den}.`,
          steps: [
            `Periksa penyebut: keduanya sama-sama per-${den}.`,
            `Bandingkan pembilang (jumlah potongan): ${n1} dibandingkan dengan ${n2}.`,
            `Hasil perbandingan yang benar adalah ${n1}/${den} ${sym} ${n2}/${den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 4: MEMBANDINGKAN PECAHAN PENYEBUT BERBEDA
    // =========================================================================
    case 4: {
      const pairs: Array<[Fraction, Fraction]> = [
        [{ num: 1, den: 2 }, { num: 2, den: 3 }],
        [{ num: 3, den: 4 }, { num: 2, den: 3 }],
        [{ num: 1, den: 3 }, { num: 1, den: 4 }],
        [{ num: 2, den: 5 }, { num: 1, den: 2 }],
        [{ num: 3, den: 5 }, { num: 1, den: 2 }],
        [{ num: 5, den: 6 }, { num: 3, den: 4 }],
        [{ num: 2, den: 4 }, { num: 1, den: 2 }],
      ];
      const [rawA, rawB] = randomItem(pairs);
      const swap = Math.random() > 0.5;
      const f1 = swap ? rawB : rawA;
      const f2 = swap ? rawA : rawB;
      const cmp = compareFractions(f1, f2);
      const sym: '<' | '=' | '>' = cmp === -1 ? '<' : cmp === 1 ? '>' : '=';
      const commonDen = lcm(f1.den, f2.den);
      const c1 = f1.num * Math.trunc(commonDen / f1.den);
      const c2 = f2.num * Math.trunc(commonDen / f2.den);

      return {
        id: qId,
        categoryId: 4,
        categoryTitle: 'Membandingkan Pecahan Penyebut Berbeda',
        interactionType: 'COMPARE_SYMBOL',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        secondTopping: secondToppingObj.id,
        dialogue: `"Chef! Antara ${f1.num}/${f1.den} pizza dan ${f2.num}/${f2.den} pizza, bagaimana perbandingan ukurannya?"`,
        promptInstruction: `Perhatikan luas gambar pizza dan garis bilangan, lalu pilih tanda perbandingan (<, =, >) yang tepat!`,
        promptFractions: [f1, f2],
        targetFraction: cmp >= 0 ? f1 : f2,
        correctCompareSymbol: sym,
        showNumberLine: true,
        cpaExplanation: {
          concrete: `Bandingkan luas ${f1.num}/${f1.den} pizza dengan ${f2.num}/${f2.den} pizza pada loyang berukuran sama.`,
          pictorial: `Jika dipotong menjadi ${commonDen} bagian sama besar: ${f1.num}/${f1.den} = ${c1}/${commonDen} dan ${f2.num}/${f2.den} = ${c2}/${commonDen}.`,
          abstract: `Karena ${c1}/${commonDen} ${sym} ${c2}/${commonDen}, maka ${f1.num}/${f1.den} ${sym} ${f2.num}/${f2.den}.`,
          steps: [
            `Samakan penyebut ${f1.den} dan ${f2.den} menggunakan KPK = ${commonDen}.`,
            `${f1.num}/${f1.den} = ${c1}/${commonDen}, sedangkan ${f2.num}/${f2.den} = ${c2}/${commonDen}.`,
            `Bandingkan pembilang baru: ${c1} ${sym} ${c2} → Jadi ${f1.num}/${f1.den} ${sym} ${f2.num}/${f2.den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 5: MENGURUTKAN PECAHAN PENYEBUT BERBEDA
    // =========================================================================
    case 5: {
      const sets: Fraction[][] = [
        [{ num: 1, den: 2 }, { num: 2, den: 3 }, { num: 3, den: 4 }],
        [{ num: 1, den: 4 }, { num: 1, den: 2 }, { num: 5, den: 6 }],
        [{ num: 1, den: 3 }, { num: 1, den: 2 }, { num: 4, den: 5 }],
        [{ num: 1, den: 6 }, { num: 1, den: 3 }, { num: 2, den: 3 }],
        [{ num: 2, den: 5 }, { num: 3, den: 4 }, { num: 9, den: 10 }],
      ];
      const baseSet = randomItem(sets);
      const ascending = Math.random() > 0.35; // 65% terkecil ke terbesar, 35% terbesar ke terkecil
      const correctOrder = sortFractions(baseSet, ascending);
      let scrambled = shuffleArray(baseSet);
      // Pastikan urutan awal tidak langsung sama dengan jawaban
      if (scrambled.every((f, idx) => areEquivalent(f, correctOrder[idx]))) {
        scrambled = [correctOrder[1], correctOrder[2], correctOrder[0]];
      }

      const commonDen = lcm(lcm(baseSet[0].den, baseSet[1].den), baseSet[2].den);
      const orderLabel = ascending ? 'TERKECIL ke TERBESAR' : 'TERBESAR ke TERKECIL';

      return {
        id: qId,
        categoryId: 5,
        categoryTitle: 'Mengurutkan Pecahan Penyebut Berbeda',
        interactionType: 'ORDER_LIST',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        dialogue: `"Chef! Tolong susun 3 piring pesanan pizza ini mulai dari porsi yang ${orderLabel}!"`,
        promptInstruction: `Susun ketiga pecahan berikut dari ${orderLabel} (ketuk kartu atau tombol geser untuk mengatur urutan):`,
        promptFractions: scrambled,
        targetFraction: correctOrder[0],
        orderAscending: ascending,
        initialOrderFractions: scrambled,
        correctOrderedFractions: correctOrder,
        showNumberLine: true,
        cpaExplanation: {
          concrete: `Ketiga loyang pizza memiliki ukuran potongan berbeda: ${scrambled.map(formatFraction).join(', ')}.`,
          pictorial: `Pada garis bilangan dan visual pizza, semakin banyak bagian yang terisi, semakin besar nilainya.`,
          abstract: `Samakan penyebut ke KPK = ${commonDen}: ${correctOrder
            .map((f) => `${formatFraction(f)} = ${(f.num * commonDen) / f.den}/${commonDen}`)
            .join(', ')}.`,
          steps: [
            `Samakan penyebut ketiga pecahan ke KPK = ${commonDen}.`,
            `Bandingkan pembilangnya setelah penyebutnya sama.`,
            `Urutan dari ${orderLabel} adalah: ${correctOrder.map(formatFraction).join(' → ')}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 6: PENJUMLAHAN PECAHAN PENYEBUT SAMA
    // =========================================================================
    case 6: {
      const den = randomItem([4, 5, 6, 8, 10]);
      const n1 = Math.floor(Math.random() * Math.max(1, den - 2)) + 1;
      const maxN2 = den - n1;
      const n2 = Math.floor(Math.random() * maxN2) + 1;
      const f1: Fraction = { num: n1, den };
      const f2: Fraction = { num: n2, den };
      const target: Fraction = { num: n1 + n2, den };

      const choices = buildChoices(
        target,
        [
          { num: n1 + n2, den: den + den }, // Kesalahan umum: menjumlahkan penyebut
          { num: Math.max(1, n1 + n2 - 1), den },
          { num: Math.min(den, n1 + n2 + 1), den },
          { num: Math.abs(n1 - n2) || 1, den },
        ],
        true
      );

      return {
        id: qId,
        categoryId: 6,
        categoryTitle: 'Penjumlahan Pecahan Penyebut Sama',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        secondTopping: secondToppingObj.id,
        dialogue: `"Chef! Saya pesan ${n1}/${den} pizza ${toppingObj.name} ditambah ${n2}/${den} pizza ${secondToppingObj.name}. Berapa total bagian pizza saya?"`,
        promptInstruction: `Jumlahkan kedua pesanan pizza berpenyebut sama berikut: ${n1}/${den} + ${n2}/${den} = ?`,
        promptFractions: [f1, f2],
        targetFraction: target,
        choices,
        cpaExplanation: {
          concrete: `Menggabungkan ${n1} potong pizza dan ${n2} potong pizza yang sama-sama berukuran 1/${den}.`,
          pictorial: `Di dalam loyang gabungan, terdapat ${n1} + ${n2} = ${n1 + n2} potong dari ${den} bagian.`,
          abstract: `${n1}/${den} + ${n2}/${den} = (${n1} + ${n2})/${den} = ${n1 + n2}/${den}. Penyebut tetap ${den}!`,
          steps: [
            `Pastikan penyebut sudah sama yaitu ${den}.`,
            `Jumlahkan pembilangnya: ${n1} + ${n2} = ${n1 + n2}.`,
            `Penyebut tetap ${den}, sehingga hasilnya ${n1 + n2}/${den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 7: PENJUMLAHAN PECAHAN PENYEBUT BERBEDA
    // =========================================================================
    case 7: {
      const pairs: Array<[Fraction, Fraction]> = [
        [{ num: 1, den: 2 }, { num: 1, den: 4 }],
        [{ num: 1, den: 2 }, { num: 1, den: 3 }],
        [{ num: 1, den: 3 }, { num: 1, den: 6 }],
        [{ num: 2, den: 3 }, { num: 1, den: 6 }],
        [{ num: 1, den: 4 }, { num: 3, den: 8 }],
        [{ num: 1, den: 2 }, { num: 3, den: 8 }],
        [{ num: 1, den: 5 }, { num: 3, den: 10 }],
      ];
      const [f1, f2] = randomItem(pairs);
      const op = addFractions(f1, f2);
      const target = op.simplifiedResult;

      const choices = buildChoices(target, [
        { num: f1.num + f2.num, den: f1.den + f2.den }, // Kesalahan klasik menjumlahkan penyebut langsung
        { num: Math.max(1, target.num - 1), den: target.den },
        { num: target.num + 1, den: target.den },
        { num: target.num, den: target.den + 2 },
      ]);

      return {
        id: qId,
        categoryId: 7,
        categoryTitle: 'Penjumlahan Pecahan Penyebut Berbeda',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        secondTopping: secondToppingObj.id,
        dialogue: `"Chef! Saya ingin ${f1.num}/${f1.den} pizza ${toppingObj.name} ditambah ${f2.num}/${f2.den} pizza ${secondToppingObj.name}. Berapa totalnya?"`,
        promptInstruction: `Gunakan metode Singapore Math CPA: samakan penyebut lalu jumlahkan ${f1.num}/${f1.den} + ${f2.num}/${f2.den}!`,
        promptFractions: [f1, f2],
        targetFraction: target,
        choices,
        cpaExplanation: {
          concrete: `Potongan 1/${f1.den} dan 1/${f2.den} berbeda ukuran sehingga harus disamakan dulu satuan potongannya.`,
          pictorial: `Ubah menjadi per-${op.lcm}: ${f1.num}/${f1.den} menjadi ${op.aConverted.num}/${op.lcm}, dan ${f2.num}/${f2.den} menjadi ${op.bConverted.num}/${op.lcm}.`,
          abstract: `${op.aConverted.num}/${op.lcm} + ${op.bConverted.num}/${op.lcm} = ${op.rawResult.num}/${op.lcm}${
            op.fpb > 1 ? ` = ${ formatFraction(target) }` : ''
          }.`,
          steps: op.steps,
        },
      };
    }

    // =========================================================================
    // KATEGORI 8: KONSEP PECAHAN CAMPURAN METODE GASING
    // =========================================================================
    case 8: {
      const whole = randomItem([1, 2, 3]);
      const den = randomItem([2, 3, 4, 5, 6, 8]);
      const num = Math.floor(Math.random() * (den - 1)) + 1;
      const target: Fraction = { whole, num, den };

      const choices = buildChoices(
        target,
        [
          { whole: whole + 1, num, den },
          { whole, num: Math.max(1, (num % (den - 1)) + 1), den },
          { whole: Math.max(1, whole - 1), num: den - num, den },
          { whole, num, den: den + 1 },
        ],
        true
      );

      return {
        id: qId,
        categoryId: 8,
        categoryTitle: 'Konsep Pecahan Campuran (Metode GASING)',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        dialogue: `"Chef! Untuk acara kelas SDN 66 Banda Aceh, kami memesan ${whole} loyang pizza utuh dan ${num} potong dari pizza yang dibagi ${den}!"`,
        promptInstruction: `Perhatikan visualisasi pizza utuh dan potongan pizza di bawah ini. Manakah penulisan PECAHAN CAMPURAN yang tepat?`,
        promptFractions: [target],
        targetFraction: target,
        choices,
        strictChoiceMatch: true,
        cpaExplanation: {
          concrete: `Terdapat ${whole} loyang pizza utuh penuh dan ${num} potong pizza berukuran 1/${den}.`,
          pictorial: `Pisahkan perhitungan loyang utuh (${whole}) dan sisa potongan (${num}/${den}).`,
          abstract: `Digabungkan menjadi pecahan campuran: ${whole} ${num}/${den}.`,
          steps: [
            `1. Hitung jumlah pizza utuh: ada ${whole} loyang utuh (Bilangan bulat = ${whole}).`,
            `2. Hitung sisa potongan pizza: ${num} bagian dari ${den} potongan (${num}/${den}).`,
            `3. Tulis sebagai pecahan campuran: ${whole} ${num}/${den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 9: MENGUBAH PECAHAN BIASA MENJADI PECAHAN CAMPURAN
    // =========================================================================
    case 9: {
      const examples: Fraction[] = [
        { num: 11, den: 4 },
        { num: 7, den: 3 },
        { num: 9, den: 4 },
        { num: 7, den: 2 },
        { num: 13, den: 5 },
        { num: 11, den: 3 },
        { num: 15, den: 4 },
        { num: 17, den: 6 },
      ];
      const improper = randomItem(examples);
      const mixed = toMixed(improper);
      const w = mixed.whole ?? 1;

      const choices = buildChoices(
        mixed,
        [
          { whole: w + 1, num: mixed.num, den: mixed.den },
          { whole: mixed.num, num: w, den: mixed.den },
          { whole: w, num: Math.max(1, mixed.den - mixed.num), den: mixed.den },
          { whole: Math.max(1, w - 1), num: mixed.num, den: mixed.den },
        ],
        true
      );

      return {
        id: qId,
        categoryId: 9,
        categoryTitle: 'Mengubah Pecahan Biasa ke Campuran',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        dialogue: `"Chef! Ada pesanan ${improper.num} potong pizza ukuran 1/${improper.den} (${improper.num}/${improper.den}). Berapa loyang utuh dan sisa potongannya?"`,
        promptInstruction: `Ubahlah pecahan tidak wajar ${improper.num}/${improper.den} menjadi PECAHAN CAMPURAN!`,
        promptFractions: [improper],
        targetFraction: mixed,
        choices,
        strictChoiceMatch: true,
        cpaExplanation: {
          concrete: `Kumpulkan ${improper.num} potong pizza seper-${improper.den}-an. Setiap ${improper.den} potong membentuk 1 loyang utuh.`,
          pictorial: `${w * improper.den} potong membentuk ${w} pizza utuh, dan tersisa ${mixed.num} potong.`,
          abstract: `${improper.num} ÷ ${improper.den} = ${w} sisa ${mixed.num} → Ditulis ${w} ${mixed.num}/${mixed.den}.`,
          steps: [
            `Bagi pembilang dengan penyebut: ${improper.num} ÷ ${improper.den} = ${w} (karena ${w} × ${improper.den} = ${w * improper.den}).`,
            `Hitung sisanya: ${improper.num} - ${w * improper.den} = ${mixed.num}.`,
            `Hasil bagi (${w}) menjadi bilangan bulat, sisa (${mixed.num}) menjadi pembilang, penyebut tetap (${improper.den}) → ${w} ${mixed.num}/${mixed.den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 10: MENYEDERHANAKAN PECAHAN (DENGAN FPB)
    // =========================================================================
    case 10: {
      const reduciblePool: Fraction[] = [
        { num: 6, den: 8 },
        { num: 4, den: 6 },
        { num: 2, den: 4 },
        { num: 4, den: 8 },
        { num: 6, den: 9 },
        { num: 8, den: 12 },
        { num: 9, den: 12 },
        { num: 6, den: 10 },
        { num: 4, den: 10 },
        { num: 10, den: 12 },
      ];
      const raw = randomItem(reduciblePool);
      const { simplified, fpb } = simplify(raw);

      const choices = buildChoices(
        simplified,
        [
          { num: simplified.num + 1, den: simplified.den + 1 },
          { num: Math.max(1, simplified.num - 1), den: simplified.den },
          { num: simplified.num, den: simplified.den + 1 },
          { num: raw.num - 1, den: raw.den - 1 },
        ],
        true
      );

      return {
        id: qId,
        categoryId: 10,
        categoryTitle: 'Menyederhanakan Pecahan',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        dialogue: `"Chef! Pesanan ${raw.num}/${raw.den} pizza ${toppingObj.name} ini potongannya terlalu kecil-kecil. Tolong sederhanakan ke bentuk paling sederhana!"`,
        promptInstruction: `Sederhanakan pecahan ${raw.num}/${raw.den} menggunakan Faktor Persekutuan Terbesar (FPB) hingga bentuk paling sederhana!`,
        promptFractions: [raw],
        targetFraction: simplified,
        choices,
        strictChoiceMatch: true,
        cpaExplanation: {
          concrete: `${raw.num} potong dari ${raw.den} bagian digabungkan setiap ${fpb} potong kecil menjadi 1 potong lebih besar.`,
          pictorial: `Kini loyang terbagi menjadi ${simplified.den} bagian sama besar dengan ${simplified.num} bagian terisi.`,
          abstract: `FPB dari ${raw.num} dan ${raw.den} adalah ${fpb}. Maka (${raw.num} ÷ ${fpb}) / (${raw.den} ÷ ${fpb}) = ${simplified.num}/${simplified.den}.`,
          steps: [
            `Cari FPB (pembagi terbesar yang sama) dari ${raw.num} dan ${raw.den}, yaitu ${fpb}.`,
            `Bagi pembilang: ${raw.num} ÷ ${fpb} = ${simplified.num}.`,
            `Bagi penyebut: ${raw.den} ÷ ${fpb} = ${simplified.den}.`,
            `Bentuk paling sederhana adalah ${simplified.num}/${simplified.den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 11: MENGUBAH PECAHAN CAMPURAN MENJADI PECAHAN BIASA
    // =========================================================================
    case 11: {
      const pool: Fraction[] = [
        { whole: 2, num: 1, den: 3 },
        { whole: 1, num: 3, den: 4 },
        { whole: 2, num: 1, den: 4 },
        { whole: 1, num: 2, den: 5 },
        { whole: 2, num: 3, den: 4 },
        { whole: 3, num: 1, den: 2 },
        { whole: 2, num: 2, den: 3 },
      ];
      const mixed = randomItem(pool);
      const improper = toImproper(mixed);
      const w = mixed.whole ?? 1;

      const choices = buildChoices(
        improper,
        [
          { num: w + mixed.num + mixed.den, den: mixed.den },
          { num: w * mixed.num + mixed.den, den: mixed.den },
          { num: improper.num + 1, den: mixed.den },
          { num: Math.max(1, improper.num - 2), den: mixed.den },
        ],
        true
      );

      return {
        id: qId,
        categoryId: 11,
        categoryTitle: 'Mengubah Pecahan Campuran ke Biasa',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        dialogue: `"Chef! Kami punya ${w} ${mixed.num}/${mixed.den} loyang pizza ${toppingObj.name}. Kalau semua loyang utuh dipotong per-${mixed.den}, jadi berapa potong seluruhnya?"`,
        promptInstruction: `Gunakan Metode GASING: ubah pecahan campuran ${w} ${mixed.num}/${mixed.den} menjadi PECAHAN BIASA!`,
        promptFractions: [mixed],
        targetFraction: improper,
        choices,
        strictChoiceMatch: true,
        cpaExplanation: {
          concrete: `Ada ${w} pizza utuh dan ${mixed.num} potong ukuran 1/${mixed.den}.`,
          pictorial: `Potong ${w} pizza utuh menjadi masing-masing ${mixed.den} bagian → didapat ${w} × ${mixed.den} = ${w * mixed.den} potong.`,
          abstract: `Rumus GASING: ((${w} × ${mixed.den}) + ${mixed.num}) / ${mixed.den} = (${w * mixed.den} + ${mixed.num}) / ${mixed.den} = ${improper.num}/${improper.den}.`,
          steps: [
            `1. Kalikan bilangan bulat dengan penyebut: ${w} × ${mixed.den} = ${w * mixed.den} potong.`,
            `2. Tambahkan dengan pembilang: ${w * mixed.den} + ${mixed.num} = ${improper.num} potong.`,
            `3. Penyebut tetap ${mixed.den}, sehingga hasilnya ${improper.num}/${improper.den}.`,
          ],
        },
      };
    }

    // =========================================================================
    // KATEGORI 12: PENJUMLAHAN PECAHAN CAMPURAN (METODE GASING)
    // =========================================================================
    case 12: {
      const pairs: Array<[Fraction, Fraction]> = [
        [{ whole: 1, num: 1, den: 2 }, { whole: 2, num: 1, den: 4 }],
        [{ whole: 1, num: 1, den: 3 }, { whole: 1, num: 1, den: 6 }],
        [{ whole: 2, num: 1, den: 4 }, { whole: 1, num: 2, den: 4 }],
        [{ whole: 1, num: 2, den: 5 }, { whole: 2, num: 1, den: 5 }],
        [{ whole: 2, num: 1, den: 2 }, { whole: 1, num: 3, den: 8 }],
      ];
      const [f1, f2] = randomItem(pairs);
      const op = addFractions(f1, f2);
      const target = op.mixedResult;

      const choices = buildChoices(
        target,
        [
          { whole: (target.whole ?? 1) + 1, num: target.num, den: target.den },
          { whole: target.whole ?? 1, num: Math.max(1, target.num - 1), den: target.den },
          { whole: Math.max(1, (target.whole ?? 2) - 1), num: target.num, den: target.den },
          { whole: target.whole ?? 1, num: f1.num + f2.num, den: f1.den + f2.den },
        ],
        true
      );

      return {
        id: qId,
        categoryId: 12,
        categoryTitle: 'Penjumlahan Pecahan Campuran',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        secondTopping: secondToppingObj.id,
        dialogue: `"Chef! Meja VIP memesan ${formatFraction(f1)} pizza ${toppingObj.name} ditambah ${formatFraction(f2)} pizza ${secondToppingObj.name}!"`,
        promptInstruction: `Jumlahkan dengan Metode GASING (pisahkan bilangan bulat dan pecahan): ${formatFraction(f1)} + ${formatFraction(f2)} = ?`,
        promptFractions: [f1, f2],
        targetFraction: target,
        choices,
        strictChoiceMatch: true,
        cpaExplanation: {
          concrete: `Gabungkan loyang pizza utuh (${f1.whole} + ${f2.whole}) lalu gabungkan potongan pecahannya (${f1.num}/${f1.den} + ${f2.num}/${f2.den}).`,
          pictorial: `Total pizza utuh menjadi ${target.whole} loyang, dan potongan pecahannya menjadi ${target.num}/${target.den}.`,
          abstract: `${formatFraction(f1)} + ${formatFraction(f2)} = ${formatFraction(target)}.`,
          steps: op.steps,
        },
      };
    }

    // =========================================================================
    // KATEGORI 13: PENGURANGAN PECAHAN CAMPURAN (DENGAN PEMINJAMAN)
    // =========================================================================
    case 13:
    default: {
      const pairs: Array<[Fraction, Fraction]> = [
        [{ whole: 3, num: 1, den: 4 }, { whole: 1, num: 1, den: 2 }],
        [{ whole: 3, num: 1, den: 3 }, { whole: 1, num: 2, den: 3 }],
        [{ whole: 4, num: 1, den: 4 }, { whole: 2, num: 3, den: 4 }],
        [{ whole: 2, num: 1, den: 6 }, { whole: 1, num: 1, den: 2 }],
        [{ whole: 3, num: 2, den: 5 }, { whole: 1, num: 4, den: 5 }],
      ];
      const [f1, f2] = randomItem(pairs);
      const sub = subtractMixedFractions(f1, f2);
      const target = sub.resultMixed;

      const choices = buildChoices(
        target,
        [
          { whole: (target.whole ?? 1) + 1, num: target.num, den: target.den }, // Lupa mengurangi bilangan bulat setelah pinjam
          { whole: target.whole ?? 1, num: Math.max(1, target.den - target.num), den: target.den }, // Mengurangkan terbalik
          { whole: (target.whole ?? 1) + 1, num: Math.max(1, target.den - target.num), den: target.den },
          { whole: Math.max(0, (target.whole ?? 1) - 1), num: target.num, den: target.den },
        ],
        true
      );

      return {
        id: qId,
        categoryId: 13,
        categoryTitle: 'Pengurangan Pecahan Campuran',
        interactionType: 'MULTIPLE_CHOICE',
        customer,
        topping: toppingObj.id,
        toppingName: toppingObj.name,
        dialogue: `"Chef! Di dapur tersedia ${formatFraction(f1)} loyang pizza ${toppingObj.name}, lalu disajikan ${formatFraction(f2)} loyang kepada pelanggan. Berapa sisanya?"`,
        promptInstruction: `Hitung pengurangan pecahan campuran (gunakan peminjaman 1 pizza utuh): ${formatFraction(f1)} - ${formatFraction(f2)} = ?`,
        promptFractions: [f1, f2],
        targetFraction: target,
        choices,
        strictChoiceMatch: true,
        cpaExplanation: {
          concrete: `Dari ${f1.whole} pizza utuh, pinjam 1 loyang utuh lalu potong menjadi ${sub.lcm}/${sub.lcm} agar pecahan cukup dikurangkan.`,
          pictorial: `${formatFraction(f1)} diubah menjadi ${formatFraction(sub.borrowedMixed)}, kemudian dikurangi ${formatFraction(sub.subtrahendCommon)}.`,
          abstract: `${formatFraction(sub.borrowedMixed)} - ${formatFraction(sub.subtrahendCommon)} = ${formatFraction(target)}.`,
          steps: sub.steps,
        },
      };
    }
  }
}
