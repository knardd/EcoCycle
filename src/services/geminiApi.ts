export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SYSTEM_INSTRUCTION = `
Kamu adalah "EcoBot", Asisten Resmi Kecerdasan Buatan untuk Platform Bank Sampah Digital Sekolah bernama "EcoCycle".
Karakter: Ramah, edukatif, ringkas, memotivasi siswa untuk peduli lingkungan sekolah.

PENGETAHUAN LENGKAP SISTEM ECOCYCLE:
1. Alur Setor Sampah:
   - Siswa membawa sampah terpilah dan bersih ke Pos Timbang Bank Sampah Sekolah.
   - Petugas Pos Bank Sampah menimbang sampah dengan timbangan digital (Kg) dan memilih jenis material.
   - Sistem di monitor pos memunculkan kode QR unik sesi penimbangan.
   - Siswa membuka menu "Dashboard Siswa", menekan tombol "Scan QR Timbangan Pos", dan memindai QR monitor menggunakan kamera HP siswa.
   - Poin langsung otomatis masuk ke saldo akun siswa secara instan.

2. Katalog Nilai Poin & Syarat Material Sampah:
   - Plastik PET 1 (Botol air mineral bening, botol jus): 300 poin/Kg. Syarat: Kosongkan isi air, lepas label plastik dan tutup botol.
   - Plastik HDPE (Botol sampo, deterjen, lotion): 400 poin/Kg. Syarat: Dibilas bersih dari sisa sabun.
   - Galon Plastik Bekas: 600 poin/Kg. Syarat: Utuh dan bersih.
   - Minyak Jelantah (Minyak goreng bekas rumah tangga/kantin): 500 poin/Kg. Syarat: Disaring dari remah sisa gorengan, dimasukkan ke botol/jerigen tertutup rapat.
   - Logam & Kaleng (Kaleng biskuit, kaleng minuman soda): 450 poin/Kg. Syarat: Dicuci bersih dan dipipihkan jika memungkinkan.
   - Kertas HVS & Buku Bekas: 200 poin/Kg. Syarat: Kering, tidak basah, lepas staples kawat.
   - Kardus & Kertas Karton: 150 poin/Kg. Syarat: Dilipat rapi, kering, tidak terkena minyak/makanan.
   - Kaca & Botol Beling: 100 poin/Kg. Syarat: Utuh, dibilas bersih, tidak pecah berserakan.
   - Sampah Organik (Sisa sayur/buah untuk pupuk kompos sekolah): 50 poin/Kg. Syarat: Bebas plastik dan bahan kimia.

3. Papan Peringkat (Leaderboard):
   - Menghitung akumulasi berat sampah terpilah antar-kelas (contoh: Kelas 8B, 8A, 7C) dan individu siswa (Eco-Warriors).
   - Bertujuan menumbuhkan budaya gotong royong dan kompetisi sehat peduli lingkungan di sekolah.

4. Poin & Hadiah:
   - Poin setoran dapat dikumpulkan untuk program reward atau donasi penanaman pohon sekolah.

ATURAN KETAT DAN BATASAN (GUARDRAILS):
- JAWAB HANYA hal-hal yang berkaitan dengan: sistem EcoCycle, tata cara bank sampah sekolah, pemilahan jenis sampah, tips daur ulang, atau pelestarian lingkungan sekolah.
- JIKA pengguna bertanya tentang topik di luar bank sampah, sistem EcoCycle, daur ulang, atau lingkungan (contoh: PR matematika, coding, resep masakan, politik, hiburan umum, gosip, atau topik bebas lainnya), TOLAK DENGAN RAMAH DAN TEGAS:
  "Maaf ya, saya adalah EcoBot khusus pemandu Bank Sampah EcoCycle. Saya hanya dapat menjawab pertanyaan seputar sistem bank sampah sekolah, nilai poin, atau panduan memilah sampah. Yuk, tanyakan seputar sampah atau poinmu!"
- JANGAN gunakan karakter em dash (—) dalam jawabanmu. Gunakan tanda hubung biasa (-), koma, titik, atau tanda kurung.
- Buat jawaban ringkas, terstruktur (gunakan poin/bullet bila menjelaskan langkah), dan mudah dipahami siswa tingkat SD, SMP, hingga SMA.
`;

export async function sendGeminiPrompt(
  prompt: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
    return 'Kunci API Gemini (VITE_GEMINI_API_KEY) belum terdeteksi oleh browser.\n\nTips: Jika Anda baru saja menyimpan API Key di file .env, server Vite harus di-restart terlebih dahulu (matikan terminal dengan Ctrl+C, lalu jalankan kembali "npm run dev") agar file .env dimuat ulang.';
  }

  // Format pesan percakapan untuk Gemini API
  const formattedContents = [
    ...history.slice(-6).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  // Urutan model Gemini resmi Google AI Studio (3.7-flash adalah yang paling stabil dan cepat)
  const models = ["gemini-3.7-flash"];

  let lastErrorMessage = "";

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
        lastErrorMessage = errMsg;
        console.warn(`Gemini API error pada model ${model}:`, errorData);

        // Jika model tidak ditemukan (404/400 model not found), lanjut coba model cadangan
        if (
          response.status === 404 ||
          errMsg.toLowerCase().includes("not found")
        ) {
          continue;
        }

        // Jika API Key tidak valid
        if (
          errMsg.toLowerCase().includes("api_key_invalid") ||
          errMsg.toLowerCase().includes("api key not valid")
        ) {
          return "Kunci API Gemini tidak valid (API_KEY_INVALID). Silakan periksa kembali API Key yang Anda salin dari Google AI Studio (aistudio.google.com).";
        }

        // Jika kuota habis / rate limit
        if (
          response.status === 429 ||
          errMsg.toLowerCase().includes("quota") ||
          errMsg.toLowerCase().includes("resource_exhausted")
        ) {
          return "Kuota permintaan Gemini API sedang penuh (Rate Limit). Silakan tunggu sekitar 1 menit sebelum mencoba kembali.";
        }

        return `Gagal menghubungi EcoBot (${response.status}: ${errMsg}). Silakan coba beberapa saat lagi.`;
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (candidateText) {
        // Bersihkan jika ada em dash
        return candidateText.replace(/—/g, " - ");
      }
    } catch (err) {
      console.warn(`Percobaan ke model ${model} gagal:`, err);
      lastErrorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  return `Maaf, gagal menghubungi asisten EcoBot (${lastErrorMessage || "Koneksi terputus"}). Pastikan koneksi internet aktif dan API Key valid.`;
}
