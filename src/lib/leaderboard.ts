import type { WasteTransaction } from '../services/ecoCycleApi'

export interface ClassLeaderboardEntry {
  rank: number
  className: string
  waliKelas: string
  totalWeightKg: number
  totalPoints: number
  activeStudents: number
  targetWeightKg: number
  badge: string
}

export interface StudentLeaderboardEntry {
  rank: number
  id: string
  name: string
  className: string
  nis: string
  totalWeightKg: number
  totalPoints: number
  depositCount: number
  tierTitle: string
}

// Data dasar kelas sekolah
const BASELINE_CLASSES: Omit<ClassLeaderboardEntry, 'rank'>[] = [
  {
    className: '8B',
    waliKelas: 'Ibu Ratna Dewi, S.Pd',
    totalWeightKg: 42.5,
    totalPoints: 6375,
    activeStudents: 8,
    targetWeightKg: 50,
    badge: 'Memimpin Klasemen'
  },
  {
    className: '8A',
    waliKelas: 'Bpk. Ahmad Fauzi, M.Pd',
    totalWeightKg: 36.2,
    totalPoints: 5430,
    activeStudents: 7,
    targetWeightKg: 50,
    badge: 'Penantang Kuat'
  },
  {
    className: '7C',
    waliKelas: 'Ibu Siti Maryam, S.Pd',
    totalWeightKg: 28.4,
    totalPoints: 4260,
    activeStudents: 6,
    targetWeightKg: 50,
    badge: 'Konsisten'
  },
  {
    className: '9B',
    waliKelas: 'Bpk. Hendra Wijaya, S.Pd',
    totalWeightKg: 22.1,
    totalPoints: 3315,
    activeStudents: 5,
    targetWeightKg: 50,
    badge: 'Meningkat'
  },
  {
    className: '7A',
    waliKelas: 'Ibu Nurul Hidayah, S.Pd',
    totalWeightKg: 19.8,
    totalPoints: 2970,
    activeStudents: 4,
    targetWeightKg: 50,
    badge: 'Aktif'
  },
  {
    className: '9A',
    waliKelas: 'Bpk. Bambang Sutrisno, M.Pd',
    totalWeightKg: 15.6,
    totalPoints: 2340,
    activeStudents: 4,
    targetWeightKg: 50,
    badge: 'Aktif'
  },
  {
    className: '8C',
    waliKelas: 'Ibu Dewi Sartika, S.Pd',
    totalWeightKg: 11.2,
    totalPoints: 1680,
    activeStudents: 3,
    targetWeightKg: 50,
    badge: 'Memulai'
  }
]

// Data dasar siswa teladan
const BASELINE_STUDENTS: Omit<StudentLeaderboardEntry, 'rank'>[] = [
  {
    id: 'std-001',
    name: 'Rian Pratama',
    className: '8B',
    nis: '8492',
    totalWeightKg: 14.8,
    totalPoints: 2220,
    depositCount: 6,
    tierTitle: 'Duta Daur Ulang'
  },
  {
    id: 'std-002',
    name: 'Siti Sarah',
    className: '8A',
    nis: '8431',
    totalWeightKg: 12.5,
    totalPoints: 1875,
    depositCount: 5,
    tierTitle: 'Pejuang Lingkungan'
  },
  {
    id: 'std-003',
    name: 'Bayu Saputra',
    className: '7C',
    nis: '8410',
    totalWeightKg: 11.2,
    totalPoints: 1680,
    depositCount: 4,
    tierTitle: 'Sahabat Alam'
  },
  {
    id: 'std-004',
    name: 'Alya Rahma',
    className: '7C',
    nis: '8403',
    totalWeightKg: 9.6,
    totalPoints: 1440,
    depositCount: 4,
    tierTitle: 'Sahabat Alam'
  },
  {
    id: 'std-005',
    name: 'Fahri Pratama',
    className: '8A',
    nis: '8421',
    totalWeightKg: 8.8,
    totalPoints: 1320,
    depositCount: 3,
    tierTitle: 'Pemilah Aktif'
  },
  {
    id: 'std-006',
    name: 'Dimas Setiawan',
    className: '9B',
    nis: '8512',
    totalWeightKg: 7.5,
    totalPoints: 1125,
    depositCount: 3,
    tierTitle: 'Pemilah Aktif'
  },
  {
    id: 'std-007',
    name: 'Zahra Amalia',
    className: '9A',
    nis: '8530',
    totalWeightKg: 6.2,
    totalPoints: 930,
    depositCount: 2,
    tierTitle: 'Pemilah Pemula'
  }
]

// Ekstrak nama kelas dari string NIS / Kelas
export function parseClassFromText(text: string): string {
  const match = text.match(/(?:Kelas\s*)?([789][A-Z])/i)
  if (match) {
    return match[1].toUpperCase()
  }
  return '8A'
}

// Menghitung peringkat kelas teragregasi secara reaktif dari transaksi aktual
export function computeClassLeaderboard(transactions: WasteTransaction[]): ClassLeaderboardEntry[] {
  // Salin baseline
  const classMap = new Map<string, Omit<ClassLeaderboardEntry, 'rank'>>()
  for (const c of BASELINE_CLASSES) {
    classMap.set(c.className, { ...c })
  }

  // Agregasikan transaksi nyata yang ada di sistem
  for (const tx of transactions) {
    const cls = parseClassFromText(tx.studentNis)
    const existing = classMap.get(cls)
    if (existing) {
      existing.totalWeightKg = Number((existing.totalWeightKg + tx.weightKg).toFixed(2))
      existing.totalPoints += tx.pointsAwarded
    } else {
      classMap.set(cls, {
        className: cls,
        waliKelas: 'Wali Kelas ' + cls,
        totalWeightKg: Number(tx.weightKg.toFixed(2)),
        totalPoints: tx.pointsAwarded,
        activeStudents: 1,
        targetWeightKg: 50,
        badge: 'Aktif'
      })
    }
  }

  // Urutkan berdasarkan total berat sampah terkumpul (descending)
  const sorted = Array.from(classMap.values()).sort((a, b) => b.totalWeightKg - a.totalWeightKg)

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1
  }))
}

// Menghitung peringkat siswa teragregasi secara reaktif dari transaksi aktual
export function computeStudentLeaderboard(transactions: WasteTransaction[]): StudentLeaderboardEntry[] {
  const studentMap = new Map<string, Omit<StudentLeaderboardEntry, 'rank'>>()

  for (const s of BASELINE_STUDENTS) {
    studentMap.set(s.name.toLowerCase(), { ...s })
  }

  // Gabungkan transaksi nyata
  for (const tx of transactions) {
    const key = tx.studentName.toLowerCase().trim()
    const cls = parseClassFromText(tx.studentNis)
    const existing = studentMap.get(key)

    if (existing) {
      existing.totalWeightKg = Number((existing.totalWeightKg + tx.weightKg).toFixed(2))
      existing.totalPoints += tx.pointsAwarded
      existing.depositCount += 1
    } else {
      studentMap.set(key, {
        id: `tx-${tx.id}`,
        name: tx.studentName,
        className: cls,
        nis: tx.studentNis.split('/')[0]?.trim() || '8400',
        totalWeightKg: Number(tx.weightKg.toFixed(2)),
        totalPoints: tx.pointsAwarded,
        depositCount: 1,
        tierTitle: tx.weightKg > 10 ? 'Pejuang Lingkungan' : 'Sahabat Alam'
      })
    }
  }

  // Urutkan siswa berdasarkan total berat sampah (descending)
  const sorted = Array.from(studentMap.values()).sort((a, b) => b.totalWeightKg - a.totalWeightKg)

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1
  }))
}
