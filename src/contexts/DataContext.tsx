import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getWasteMaterials,
  getVoucherCatalog,
  getWasteDeposits,
  getClaimedVouchers,
  DEFAULT_CATEGORIES,
  DEFAULT_REWARDS,
  type WasteCategory,
  type WasteTransaction,
  type RewardItem,
  type ClaimedVoucher
} from '../services/ecoCycleApi'
import type { DailyMission, EduArticle, EduVideo, ActivityAnnouncement } from '../types/education'

const getTodayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const createInitialMissions = (): DailyMission[] => [
  {
    id: 'mis-login',
    title: 'Login Harian (Check-in)',
    description: 'Buka aplikasi EcoCycle hari ini',
    pointsReward: 10,
    type: 'login',
    isCompleted: true,
    isClaimed: false,
    targetCount: 1,
    currentCount: 1
  },
  {
    id: 'mis-read',
    title: 'Baca 1 Artikel Edukasi',
    description: 'Buka dan baca panduan daur ulang di halaman Edukasi',
    pointsReward: 20,
    type: 'read_article',
    isCompleted: false,
    isClaimed: false,
    targetCount: 1,
    currentCount: 0
  },
  {
    id: 'mis-video',
    title: 'Tonton 1 Video Edukasi',
    description: 'Tonton video tutorial singkat pemilahan sampah sampai selesai',
    pointsReward: 25,
    type: 'watch_video',
    isCompleted: false,
    isClaimed: false,
    targetCount: 1,
    currentCount: 0
  },
  {
    id: 'mis-article',
    title: 'Artikel Disetujui Guru',
    description: 'Poin cair saat naskah karya daur ulangmu disetujui guru/staf hari ini',
    pointsReward: 50,
    type: 'article_approved',
    isCompleted: false,
    isClaimed: false,
    targetCount: 1,
    currentCount: 0
  }
]

const DEFAULT_ARTICLES: EduArticle[] = [
  {
    id: 'art-1',
    title: 'Panduan Praktis Membedakan Plastik PET 1 dan HDPE 2',
    category: 'Plastik',
    authorName: 'Tim Edukasi EcoCycle',
    authorRole: 'Pengelola EcoCycle',
    summary: 'Ketahui perbedaan botol bening PET 1 dan botol tebal HDPE 2 agar poin setoranmu maksimal di bank sampah.',
    content: `Plastik merupakan salah satu material paling banyak kita temui di sekolah dan rumah. Namun, tahukah kamu bahwa tidak semua plastik bisa dicampur saat disetorkan ke bank sampah?

1. Plastik PET 1 (Polyethylene Terephthalate):
Biasanya digunakan untuk botol air mineral bening, botol minuman soda, atau botol jus. Karakteristiknya jernih, kaku, dan tembus pandang.
Syarat setor: Kosongkan airnya, lepas tutup botol dan label plastiknya, lalu pipihkan agar tidak memakan tempat.

2. Plastik HDPE 2 (High-Density Polyethylene):
Biasa digunakan untuk botol sampo, botol deterjen cair, atau jeriken susu. Plastiknya lebih tebal, lentur, dan tahan suhu tinggi.
Syarat setor: Bilas bersih sisa sabun atau cairan dari dalam botol, keringkan, dan tutup rapat.

Dengan memilah kedua jenis plastik ini secara terpisah, kamu membantu pabrik daur ulang memproses sampah menjadi biji plastik berkualitas tinggi!`,
    readTimeMinutes: 2,
    status: 'approved',
    submittedAt: '01 Nov 2026',
    approvedAt: '01 Nov 2026',
    pointsReward: 0
  },
  {
    id: 'art-2',
    title: 'Kreasi Pot Tanaman Karakter dari Botol Plastik Bekas',
    category: 'Kreasi Kriya',
    authorName: 'Siti Rahmawati',
    authorRole: 'Siswa',
    authorClassName: '8B',
    authorNis: '8419',
    summary: 'Yuk manfaatkan botol air mineral ukuran besar menjadi pot gantung lucu berbentuk kelinci dan kucing.',
    content: `Halo teman-teman! Di kelas 8B, kami baru saja mencoba kegiatan upcycling untuk mempercantik taman vertikal di depan kelas. Kami mengubah botol air mineral 1.5 liter bekas menjadi pot tanaman karakter!

Alat dan Bahan:
1. 2 botol air mineral bekas ukuran 1.5 liter (bersih dan kering)
2. Gunting atau cutter (minta dampingan guru saat memotong)
3. Cat akrilik warna putih, pink, dan spidol hitam permanen
4. Tanah subur dan tanaman sirih gading / bunga krokot
5. Tali rami untuk gantungan

Langkah Pembuatan:
1. Gambar pola telinga kelinci atau kucing di bagian tengah badan botol.
2. Gunting perlahan mengikuti pola telinga. Lubangi 3 titik kecil di bagian dasar botol untuk resapan air.
3. Cat seluruh permukaan botol dengan cat akrilik putih sebagai dasaran.
4. Gambar mata, hidung, dan kumis kelinci menggunakan spidol hitam.
5. Masukkan tanah dan tanam bibit bunga. Pot lucu siap digantung!

Yuk coba buat di rumah daripada botol bekas langsung dibuang!`,
    readTimeMinutes: 3,
    status: 'approved',
    submittedAt: '01 Nov 2026',
    approvedAt: '01 Nov 2026',
    pointsReward: 50
  },
  {
    id: 'art-3',
    title: 'Bahaya Membuang Minyak Jelantah ke Saluran Air',
    category: 'Minyak Jelantah',
    authorName: 'Bpk. Ahmad Fauzi, M.Pd',
    authorRole: 'Pengelola EcoCycle',
    summary: 'Satu liter minyak jelantah dapat mencemari ribuan liter air bersih jika dibuang sembarangan.',
    content: `Banyak dari kita yang sering melihat minyak goreng sisa (jelantah) langsung dibuang ke wastafel atau selokan dapur. Tahukah kamu bahaya besar di baliknya?

Ketika minyak jelantah masuk ke pipa selokan, minyak tersebut akan mengeras dan menggumpal bersama kotoran lain, membentuk sumbatan besar (fatberg) yang menyebabkan selokan mampet dan bau busuk.

Lebih parah lagi, ketika minyak tersebut mengalir ke sungai atau laut, lapisan minyak akan menutupi permukaan air sehingga sinar matahari dan oksigen tidak bisa menembus air. Akibatnya, ikan dan tanaman air mati kehabisan nafas.

Solusi Terbaik di Sekolah Kita:
Jangan buang minyak jelantahmu! Saring remah gorengannya, tampung di botol plastik tertutup, dan setorkan ke Pos Bank Sampah EcoCycle. Minyak jelantah yang terkumpul akan disalurkan ke mitra pengolah untuk diubah menjadi biodiesel ramah lingkungan, dan kamu mendapatkan poin setoran!`,
    readTimeMinutes: 2,
    status: 'approved',
    submittedAt: '02 Nov 2026',
    approvedAt: '02 Nov 2026',
    pointsReward: 0
  },
  {
    id: 'art-4',
    title: 'Membuat Tempat Pensil Meja dari Kardus Bekas Susu',
    category: 'Kertas & Kardus',
    authorName: 'Dimas Anggara',
    authorRole: 'Siswa',
    authorClassName: '7A',
    authorNis: '8520',
    summary: 'Kreasi sederhana mengubah kotak kardus susu UHT menjadi organizer meja belajar yang estetik dan rapi.',
    content: `Setiap pagi saya sering minum susu kotak di rumah. Kotak kardusnya tebal dan sayang jika langsung dibuang. Jadi saya membuat tempat pensil sekat untuk meja belajar.

Bahan yang dibutuhkan:
- 3 kotak susu bekas (dicuci bersih dan dikeringkan agar tidak bau)
- Kertas kado motif atau kertas cokelat daur ulang
- Lem kertas dan gunting

Cara membuat:
1. Potong bagian atas kotak susu dengan tinggi yang berbeda (tinggi untuk penggaris, sedang untuk pulpen, pendek untuk penghapus).
2. Rekatkan ketiga kotak tersebut menjadi satu baris menggunakan lem.
3. Bungkus bagian luarnya dengan kertas kado rapi.
4. Meja belajar jadi jauh lebih rapi tanpa beli organizer baru!`,
    readTimeMinutes: 2,
    status: 'pending_review',
    submittedAt: '02 Nov 2026',
    pointsReward: 50
  }
]

const DEFAULT_VIDEOS: EduVideo[] = [
  {
    id: 'vid-1',
    title: 'Cara Mudah Memilah Sampah dari Rumah',
    duration: '2:45',
    category: 'Dasar Pemilahan',
    embedUrl: 'https://www.youtube-nocookie.com/embed/OasbYWF4_S8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    description: 'Panduan praktis memilah sampah organik dan anorganik dari dapur rumah agar siap disetor ke bank sampah.'
  },
  {
    id: 'vid-2',
    title: 'Tutorial Upcycle: Kreasi Pot Lucu Botol Bekas',
    duration: '3:20',
    category: 'DIY Kerajinan',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=600&q=80',
    description: 'Video tutorial kreasi kerajinan tangan pot tanaman karakter hewan yang gampang dipraktikkan siswa di rumah.'
  },
  {
    id: 'vid-3',
    title: 'Kisah Perjalanan Sampah Daur Ulang Menjadi Barang Baru',
    duration: '4:15',
    category: 'Wawasan Daur Ulang',
    embedUrl: 'https://www.youtube-nocookie.com/embed/UR334t9cIvg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    description: 'Mengintip alur pengolahan botol plastik bekas setelah disetor hingga menjadi benang poliester dan baju.'
  }
]

const DEFAULT_ANNOUNCEMENTS: ActivityAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Kerja Bakti Bersih Saluran Air & Pilah Sampah Lingkungan',
    date: '2026-11-08',
    time: '07:00 - 09:30 WIB',
    location: 'Halaman Pos Bank Sampah & Sepanjang Jl. Melati',
    description: 'Aksi gotong royong membersihkan selokan serta mengumpulkan sampah botol dan plastik terpilah agar lingkungan bebas genangan air dan sarang nyamuk.',
    createdAt: '01 Nov 2026'
  },
  {
    id: 'ann-2',
    title: 'Aksi Akbar Sedekah Jelantah & Pilah Kardus',
    date: '2026-11-15',
    time: '08:00 - 11:00 WIB',
    location: 'Balai Warga RW 04',
    description: 'Pengumpulan minyak jelantah sisa dapur rumah tangga dalam botol tertutup serta kardus/kertas bekas untuk disalurkan ke mitra daur ulang resmi.',
    createdAt: '02 Nov 2026'
  },
  {
    id: 'ann-3',
    title: 'Aksi Tanam 50 Pohon Peneduh & Pembuatan Biopori',
    date: '2026-10-25',
    time: '07:30 - 10:00 WIB',
    location: 'Area Hijau Halaman Sekolah',
    description: 'Penanaman bibit pohon peneduh dan pembuatan lubang biopori resapan air hujan bersama warga lingkungan sekitar sekolah.',
    createdAt: '20 Okt 2026'
  }
]

interface DataContextType {
  categories: WasteCategory[]
  availableRewards: RewardItem[]
  transactions: WasteTransaction[]
  claimedVouchers: ClaimedVoucher[]
  isSyncing: boolean
  isSupabaseLive: boolean
  syncData: () => Promise<void>
  addTransaction: (tx: WasteTransaction) => void
  deleteTransaction: (id: string) => void
  addClaimedVoucher: (vcr: ClaimedVoucher) => void
  totalWeightKg: number
  totalEarnedPoints: number
  totalSpentPoints: number
  currentPoolPoints: number
  waterProtectedLiters: number
  co2ReducedKg: string
  // State Edukasi & Misi Harian
  dailyMissions: DailyMission[]
  articles: EduArticle[]
  videos: EduVideo[]
  announcements: ActivityAnnouncement[]
  missionBonusClaimed: boolean
  claimMissionReward: (missionId: string) => number
  claimAllClearBonus: () => number
  markArticleRead: (articleId: string) => void
  markVideoWatched: (videoId: string) => void
  submitArticle: (data: {
    title: string
    category: EduArticle['category']
    content: string
    summary: string
    authorName: string
    authorNis?: string
    authorClassName?: string
  }) => void
  approveArticle: (articleId: string) => void
  rejectArticle: (articleId: string) => void
  addAnnouncement: (data: {
    title: string
    date: string
    time: string
    location: string
    description: string
  }) => void
  deleteAnnouncement: (id: string) => void
  claimTransactionLocally: (
    tokenOrRef: string,
    studentName: string,
    studentNis: string
  ) => { points: number; refCode: string } | null
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<WasteCategory[]>(DEFAULT_CATEGORIES)
  const [availableRewards, setAvailableRewards] = useState<RewardItem[]>(DEFAULT_REWARDS)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSupabaseLive, setIsSupabaseLive] = useState(false)

  const [transactions, setTransactions] = useState<WasteTransaction[]>([
    {
      id: 'TRX-2026-001',
      studentName: 'Fahri Pratama',
      studentNis: '8421 / Kelas 8A',
      materialCode: 'PET-1',
      materialName: 'Plastik PET 1 (Botol Bening)',
      weightKg: 2.4,
      pointsAwarded: 720,
      dateRecorded: '01 Nov 2026, 08:45 WIB',
      status: 'Terverifikasi'
    },
    {
      id: 'TRX-2026-002',
      studentName: 'Alya Rahma',
      studentNis: '8403 / Kelas 7C',
      materialCode: 'KARTON',
      materialName: 'Kardus & Kertas Karton',
      weightKg: 4.1,
      pointsAwarded: 615,
      dateRecorded: '01 Nov 2026, 09:20 WIB',
      status: 'Terverifikasi'
    },
    {
      id: 'TRX-2026-003',
      studentName: 'Dimas Setiawan',
      studentNis: '8512 / Kelas 9B',
      materialCode: 'JELANTAH',
      materialName: 'Minyak Jelantah',
      weightKg: 1.5,
      pointsAwarded: 750,
      dateRecorded: '01 Nov 2026, 10:05 WIB',
      status: 'Terverifikasi'
    }
  ])

  const [claimedVouchers, setClaimedVouchers] = useState<ClaimedVoucher[]>([
    {
      code: 'KOP-88219-X',
      title: 'Voucher Belanja Koperasi Rp 5.000',
      costPoints: 500,
      claimedAt: '01 Nov 2026, 09:00 WIB'
    }
  ])

  // State Misi Harian & Edukasi
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    try {
      const savedDate = localStorage.getItem('ecocycle_missions_date')
      const savedMissions = localStorage.getItem('ecocycle_missions_data')
      const today = getTodayKey()
      if (savedDate === today && savedMissions) {
        return JSON.parse(savedMissions)
      }
      return createInitialMissions()
    } catch {
      return createInitialMissions()
    }
  })

  const [missionBonusClaimed, setMissionBonusClaimed] = useState<boolean>(() => {
    try {
      const savedDate = localStorage.getItem('ecocycle_missions_date')
      const today = getTodayKey()
      if (savedDate === today) {
        return localStorage.getItem('ecocycle_mission_bonus_claimed') === 'true'
      }
      return false
    } catch {
      return false
    }
  })

  const [articles, setArticles] = useState<EduArticle[]>(() => {
    try {
      const saved = localStorage.getItem('ecocycle_articles_data')
      if (saved) return JSON.parse(saved)
      return DEFAULT_ARTICLES
    } catch {
      return DEFAULT_ARTICLES
    }
  })

  const [videos] = useState<EduVideo[]>(DEFAULT_VIDEOS)

  const [announcements, setAnnouncements] = useState<ActivityAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('ecocycle_announcements_data')
      if (saved) return JSON.parse(saved)
      return DEFAULT_ANNOUNCEMENTS
    } catch {
      return DEFAULT_ANNOUNCEMENTS
    }
  })

  // Simpan Pengumuman ke localStorage saat berubah
  useEffect(() => {
    try {
      localStorage.setItem('ecocycle_announcements_data', JSON.stringify(announcements))
    } catch {
      // Abaikan jika storage disabled
    }
  }, [announcements])

  // Simpan Misi ke localStorage saat berubah
  useEffect(() => {
    try {
      const today = getTodayKey()
      localStorage.setItem('ecocycle_missions_date', today)
      localStorage.setItem('ecocycle_missions_data', JSON.stringify(dailyMissions))
      localStorage.setItem('ecocycle_mission_bonus_claimed', String(missionBonusClaimed))
    } catch {
      // Abaikan jika storage disabled
    }
  }, [dailyMissions, missionBonusClaimed])

  // Simpan Artikel ke localStorage saat berubah
  useEffect(() => {
    try {
      localStorage.setItem('ecocycle_articles_data', JSON.stringify(articles))
    } catch {
      // Abaikan jika storage disabled
    }
  }, [articles])

  const syncData = async () => {
    setIsSyncing(true)
    try {
      const [mats, rews, deps, vchs] = await Promise.all([
        getWasteMaterials(),
        getVoucherCatalog(),
        getWasteDeposits(),
        getClaimedVouchers()
      ])
      setCategories(mats)
      setAvailableRewards(rews)
      if (deps.length > 0) setTransactions(deps)
      if (vchs.length > 0) setClaimedVouchers(vchs)
      setIsSupabaseLive(true)
    } catch {
      setIsSupabaseLive(false)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([
      getWasteMaterials(),
      getVoucherCatalog(),
      getWasteDeposits(),
      getClaimedVouchers()
    ])
      .then(([mats, rews, deps, vchs]) => {
        if (!active) return
        setCategories(mats)
        setAvailableRewards(rews)
        if (deps.length > 0) setTransactions(deps)
        if (vchs.length > 0) setClaimedVouchers(vchs)
        setIsSupabaseLive(true)
      })
      .catch(() => {
        if (active) setIsSupabaseLive(false)
      })

    return () => {
      active = false
    }
  }, [])

  const addTransaction = (tx: WasteTransaction) => {
    setTransactions(prev => [tx, ...prev])
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const addClaimedVoucher = (vcr: ClaimedVoucher) => {
    setClaimedVouchers(prev => [vcr, ...prev])
  }

  // Fungsi Misi Harian & Edukasi
  const claimMissionReward = (missionId: string): number => {
    let pointsAwarded = 0
    setDailyMissions(prev =>
      prev.map(m => {
        if (m.id === missionId && m.isCompleted && !m.isClaimed) {
          pointsAwarded = m.pointsReward
          return { ...m, isClaimed: true }
        }
        return m
      })
    )
    return pointsAwarded
  }

  const claimAllClearBonus = (): number => {
    if (missionBonusClaimed) return 0
    const allDone = dailyMissions.every(m => m.isCompleted)
    if (allDone) {
      setMissionBonusClaimed(true)
      return 40 // +40 poin bonus
    }
    return 0
  }

  const markArticleRead = (_articleId: string) => {
    setDailyMissions(prev =>
      prev.map(m => {
        if (m.type === 'read_article' && !m.isCompleted) {
          return { ...m, isCompleted: true, currentCount: 1 }
        }
        return m
      })
    )
  }

  const markVideoWatched = (_videoId: string) => {
    setDailyMissions(prev =>
      prev.map(m => {
        if (m.type === 'watch_video' && !m.isCompleted) {
          return { ...m, isCompleted: true, currentCount: 1 }
        }
        return m
      })
    )
  }

  const submitArticle = (data: {
    title: string
    category: EduArticle['category']
    content: string
    summary: string
    authorName: string
    authorNis?: string
    authorClassName?: string
  }) => {
    const now = new Date()
    const dd = now.getDate().toString().padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const dateFormatted = `${dd} ${months[now.getMonth()]} ${now.getFullYear()}`

    const newArticle: EduArticle = {
      id: `art-user-${Date.now()}`,
      title: data.title,
      category: data.category,
      authorName: data.authorName,
      authorRole: 'Siswa',
      authorNis: data.authorNis,
      authorClassName: data.authorClassName,
      summary: data.summary,
      content: data.content,
      readTimeMinutes: Math.max(1, Math.round(data.content.split(' ').length / 120)),
      status: 'pending_review',
      submittedAt: dateFormatted,
      pointsReward: 50
    }

    setArticles(prev => [newArticle, ...prev])
  }

  const approveArticle = (articleId: string) => {
    const now = new Date()
    const dd = now.getDate().toString().padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const dateFormatted = `${dd} ${months[now.getMonth()]} ${now.getFullYear()}`

    setArticles(prev =>
      prev.map(art => {
        if (art.id === articleId) {
          return {
            ...art,
            status: 'approved',
            approvedAt: dateFormatted
          }
        }
        return art
      })
    )

    // Tandai misi "Artikel Disetujui Guru" menjadi selesai pada hari ini
    setDailyMissions(prev =>
      prev.map(m => {
        if (m.type === 'article_approved' && !m.isCompleted) {
          return { ...m, isCompleted: true, currentCount: 1 }
        }
        return m
      })
    )
  }

  const rejectArticle = (articleId: string) => {
    setArticles(prev =>
      prev.map(art => {
        if (art.id === articleId) {
          return { ...art, status: 'rejected' }
        }
        return art
      })
    )
  }

  const addAnnouncement = (data: {
    title: string
    date: string
    time: string
    location: string
    description: string
  }) => {
    const now = new Date()
    const dd = now.getDate().toString().padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const dateFormatted = `${dd} ${months[now.getMonth()]} ${now.getFullYear()}`

    const newAnn: ActivityAnnouncement = {
      id: `ann-${Date.now()}`,
      ...data,
      createdAt: dateFormatted
    }
    setAnnouncements(prev => [newAnn, ...prev])
  }

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const claimTransactionLocally = (
    tokenOrRef: string,
    studentName: string,
    studentNis: string
  ) => {
    let claimedPoints = 0
    let claimedRef = tokenOrRef

    setTransactions(prev => {
      // Cari transaksi yang cocok dengan token/id, atau yang statusnya masih 'Menunggu Scan'
      let matched = false
      return prev.map(tx => {
        if (!matched && (tx.id === tokenOrRef || tx.status === 'Menunggu Scan')) {
          matched = true
          claimedPoints = tx.pointsAwarded
          claimedRef = tx.id
          return {
            ...tx,
            studentName,
            studentNis,
            status: 'Terverifikasi' as const
          }
        }
        return tx
      })
    })

    if (claimedPoints > 0) {
      return { points: claimedPoints, refCode: claimedRef }
    }
    return null
  }

  const totalWeightKg = transactions.reduce((sum, t) => sum + t.weightKg, 0)
  const totalEarnedPoints = transactions.reduce((sum, t) => sum + t.pointsAwarded, 0)
  const totalSpentPoints = claimedVouchers.reduce((sum, v) => sum + v.costPoints, 0)
  const currentPoolPoints = totalEarnedPoints - totalSpentPoints

  const waterProtectedLiters = Math.round(totalWeightKg * 18)
  const co2ReducedKg = (totalWeightKg * 2.5).toFixed(1)

  return (
    <DataContext.Provider
      value={{
        categories,
        availableRewards,
        transactions,
        claimedVouchers,
        isSyncing,
        isSupabaseLive,
        syncData,
        addTransaction,
        deleteTransaction,
        addClaimedVoucher,
        totalWeightKg,
        totalEarnedPoints,
        totalSpentPoints,
        currentPoolPoints,
        waterProtectedLiters,
        co2ReducedKg,
        dailyMissions,
        articles,
        videos,
        announcements,
        missionBonusClaimed,
        claimMissionReward,
        claimAllClearBonus,
        markArticleRead,
        markVideoWatched,
        submitArticle,
        approveArticle,
        rejectArticle,
        addAnnouncement,
        deleteAnnouncement,
        claimTransactionLocally
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
