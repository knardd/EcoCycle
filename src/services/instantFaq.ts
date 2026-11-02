export interface FaqItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
}

export const INSTANT_FAQS: FaqItem[] = [
  {
    id: "cara-setor",
    question: "Bagaimana cara setor sampah di pos?",
    keywords: [
      "cara setor",
      "setor sampah",
      "alur setor",
      "cara dapat poin",
      "dapat poin",
      "menimbang",
      "timbang",
      "scan qr",
      "pos timbang",
      "pos",
    ],
    answer: `Berikut 4 langkah praktis setor sampah di Pos Timbang EcoCycle:

1. Pemilahan Mandiri: Bawa sampah terpilah (kering dan bersih) ke Pos Timbang Sekolah.
2. Penimbangan Digital: Petugas Pos menimbang sampah dan memilih jenis material di layar pos.
3. Tampilkan QR: Layar monitor pos memunculkan kode QR unik sesi penimbanganmu.
4. Scan & Terima Poin: Buka menu "Dashboard Siswa", tekan "Scan QR Timbangan Pos", lalu arahkan kamera ke monitor pos. Poin otomatis masuk ke saldo akunmu seketika!`,
  },
  {
    id: "poin-botol-plastik",
    question: "Berapa poin 1 Kg botol plastik?",
    keywords: [
      "poin botol",
      "botol plastik",
      "poin plastik",
      "pet",
      "hdpe",
      "galon",
      "1 kg botol",
      "nilai botol",
    ],
    answer: `Nilai poin untuk kategori plastik di EcoCycle:

- Plastik PET 1 (Botol air mineral bening, botol jus): 300 Poin/Kg.
  Syarat: Kosongkan air, lepas tutup botol dan label plastik, pipihkan jika memungkinkan.
- Plastik HDPE (Botol sampo, deterjen, lotion): 400 Poin/Kg.
  Syarat: Dibilas bersih dari sisa cairan sabun.
- Galon Plastik Bekas: 600 Poin/Kg.
  Syarat: Bersih dan dalam kondisi utuh.`,
  },
  {
    id: "minyak-jelantah",
    question: "Syarat setor minyak jelantah?",
    keywords: [
      "minyak jelantah",
      "jelantah",
      "minyak goreng",
      "minyak bekas",
      "syarat jelantah",
      "poin jelantah",
    ],
    answer: `Syarat dan nilai setor Minyak Jelantah (500 Poin/Kg):

1. Dinginkan minyak goreng sisa pakai terlebih dahulu.
2. Saring dari remah gorengan atau sisa makanan padat.
3. Masukkan ke dalam botol plastik atau jerigen tertutup rapat agar tidak bocor.
4. Jangan mencampurkan minyak dengan air atau bahan kimia lain.

Minyak jelantah yang disetor akan disalurkan ke mitra resmi pengolah bahan bakar terbarukan (biodiesel).`,
  },
  {
    id: "naikkan-peringkat",
    question: "Cara menaikkan peringkat kelas?",
    keywords: [
      "peringkat kelas",
      "peringkat",
      "leaderboard",
      "papan peringkat",
      "cara juara",
      "menang lomba",
      "poin kelas",
      "eco warriors",
    ],
    answer: `Strategi mendongkrak posisi kelasmu di Papan Peringkat EcoCycle:

1. Buat "Pojok Pilah Sampah" di dalam ruang kelas khusus botol plastik dan kertas buku.
2. Koordinasikan dengan teman sekelas untuk membawa sampah kering dari rumah setiap jadwal setoran pos.
3. Utamakan material berbobot tinggi seperti tumpukan kardus, kertas arsip, dan botol plastik.
4. Lakukan setoran secara kolektif bersama perwakilan kelas.

Pantau posisi kelasmu secara langsung setiap hari di menu "Papan Peringkat"!`,
  },
  {
    id: "katalog-sampah",
    question: "Sampah apa saja yang diterima?",
    keywords: [
      "sampah apa saja",
      "katalog sampah",
      "jenis sampah",
      "material apa saja",
      "daftar sampah",
      "kategori sampah",
    ],
    answer: `EcoCycle menerima 9 kategori sampah terpilah dengan rincian poin:

1. Galon Plastik: 600 Poin/Kg
2. Minyak Jelantah: 500 Poin/Kg
3. Logam & Kaleng: 450 Poin/Kg
4. Plastik HDPE (Botol sabun/sampo): 400 Poin/Kg
5. Plastik PET (Botol minum bening): 300 Poin/Kg
6. Kertas HVS & Buku Bekas: 200 Poin/Kg
7. Kardus & Karton: 150 Poin/Kg
8. Kaca & Botol Beling: 100 Poin/Kg
9. Sampah Organik (Sisa sayur/buah kompos): 50 Poin/Kg

Pastikan semua sampah dalam kondisi kering dan bersih sebelum ditimbang ya!`,
  },
  {
    id: "kegunaan-poin",
    question: "Poin untuk apa saja?",
    keywords: [
      "tukar poin",
      "poin untuk apa",
      "hadiah",
      "reward",
      "kegunaan poin",
      "manfaat poin",
      "tukar hadiah",
    ],
    answer: `Poin EcoCycle yang kamu kumpulkan dapat dimanfaatkan untuk:

1. Klaim Hadiah Ramah Lingkungan: Tukarkan dengan tumbler stainless, bibit pohon, alat tulis, atau tote bag kanvas di menu "Katalog Hadiah".
2. Donasi Lingkungan: Alokasikan poin untuk penanaman pohon peneduh di area taman sekolah.
3. Meraih Gelar Prestasi: Akumulasi poin menentukan lencana Eco-Warrior di profil siswa dan sertifikat apresiasi semester.`,
  },
  {
    id: "jadwal-pos",
    question: "Kapan jadwal pos timbang buka?",
    keywords: [
      "jadwal pos",
      "jam buka",
      "kapan buka",
      "lokasi pos",
      "di mana pos",
      "pos timbang buka jam berapa",
    ],
    answer: `Informasi Operasional Pos Timbang EcoCycle:

- Lokasi: Gazebo Hijau Depan Taman Lingkungan Sekolah.
- Hari Operasional: Senin sampai Jumat (hari sekolah aktif).
- Jam Layanan:
  - Sesi Pagi: Istirahat pertama (09.30 - 10.00 WIB)
  - Sesi Siang: Setelah jam pulang sekolah (14.30 - 15.30 WIB)

Silakan siapkan sampah yang sudah dipilah rapi sebelum jam layanan dimulai!`,
  },
];

export const QUICK_PROMPTS = [
  "Bagaimana cara setor sampah di pos?",
  "Berapa poin 1 Kg botol plastik?",
  "Syarat setor minyak jelantah?",
  "Cara menaikkan peringkat kelas?",
  "Sampah apa saja yang diterima?",
  "Poin untuk apa saja?",
  "Kapan jadwal pos timbang buka?",
];

/**
 * Mencari jawaban template instan berdasarkan pertanyaan pengguna.
 * Mengembalikan string jawaban jika cocok, atau null jika perlu diteruskan ke AI.
 */
export function findInstantFaq(query: string): string | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  // 1. Cek kecocokan persis pada judul pertanyaan
  const exactMatch = INSTANT_FAQS.find(
    (faq) =>
      faq.question.toLowerCase() === normalized ||
      normalized.includes(faq.question.toLowerCase()),
  );
  if (exactMatch) {
    return exactMatch.answer;
  }

  // 2. Cek kecocokan kata kunci (keyword scoring)
  let bestMatch: FaqItem | null = null;
  let highestScore = 0;

  for (const faq of INSTANT_FAQS) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (normalized.includes(keyword)) {
        // Keyword lebih panjang diberi bobot lebih tinggi karena lebih spesifik
        score += keyword.length;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  // Ambang batas kecocokan kata kunci (minimal 3 karakter kata cocok)
  if (bestMatch && highestScore >= 4) {
    return bestMatch.answer;
  }

  return null;
}
