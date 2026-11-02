import { supabase } from '../lib/supabase'

export interface WasteCategory {
  id: string
  code: string
  name: string
  type: string
  pointsPerKg: number
  specification: string
}

export interface WasteTransaction {
  id: string
  studentName: string
  studentNis: string
  materialCode: string
  materialName: string
  weightKg: number
  pointsAwarded: number
  dateRecorded: string
  status: 'Terverifikasi' | 'Menunggu Scan' | 'Dibatalkan'
}

export interface RewardItem {
  id: string
  title: string
  category: 'Koperasi' | 'Lingkungan'
  costPoints: number
  stock: number
  description: string
}

export interface ClaimedVoucher {
  code: string
  title: string
  costPoints: number
  claimedAt: string
}

// Fallback data jika tabel database belum di-seed
export const DEFAULT_CATEGORIES: WasteCategory[] = [
  {
    id: '1',
    code: 'PET-1',
    name: 'Plastik PET 1 (Botol Bening)',
    type: 'Anorganik',
    pointsPerKg: 300,
    specification: 'Botol air mineral/jus bersih, label & tutup dilepas, dipipihkan'
  },
  {
    id: '2',
    code: 'HDPE-2',
    name: 'Plastik HDPE (Wadah Keras)',
    type: 'Anorganik',
    pointsPerKg: 250,
    specification: 'Botol shampoo, botol sabun cair, jeriken, dibilas bersih'
  },
  {
    id: '3',
    code: 'KARTON',
    name: 'Kardus & Kertas Karton',
    type: 'Serat Kertas',
    pointsPerKg: 150,
    specification: 'Kardus cokelat kering dan bersih, diikat per bundel rapi'
  },
  {
    id: '4',
    code: 'JELANTAH',
    name: 'Minyak Jelantah',
    type: 'Cairan Minyak',
    pointsPerKg: 500,
    specification: 'Minyak goreng bekas pakai yang disaring, wadah botol tertutup'
  },
  {
    id: '5',
    code: 'KALENG',
    name: 'Logam & Kaleng Aluminium',
    type: 'Anorganik',
    pointsPerKg: 400,
    specification: 'Kaleng minuman atau biskuit, bersih dan tidak berkarat parah'
  }
]

export const DEFAULT_REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'Voucher Belanja Koperasi Rp 5.000',
    category: 'Koperasi',
    costPoints: 500,
    stock: 25,
    description: 'Untuk alat tulis atau makanan ringan di koperasi sekolah'
  },
  {
    id: 'rew-2',
    title: 'Voucher Belanja Koperasi Rp 10.000',
    category: 'Koperasi',
    costPoints: 1000,
    stock: 12,
    description: 'Untuk pembelanjaan kebutuhan belajar di koperasi sekolah'
  },
  {
    id: 'rew-3',
    title: 'Donasi 1 Bibit Pohon Peneduh',
    category: 'Lingkungan',
    costPoints: 800,
    stock: 50,
    description: 'Ditanam di area penghijauan sekolah atas nama siswa'
  }
]

// 1. Ambil Katalog Sampah dari Supabase
export async function getWasteMaterials(): Promise<WasteCategory[]> {
  try {
    const { data, error } = await supabase
      .from('waste_materials')
      .select('id, code, name, category, points_per_kg, specification')
      .eq('is_active', true)
      .order('code', { ascending: true })

    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORIES
    }

    return data.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      type: item.category,
      pointsPerKg: item.points_per_kg,
      specification: item.specification || 'Wajib bersih dan kering'
    }))
  } catch {
    return DEFAULT_CATEGORIES
  }
}

// 2. Ambil Katalog Voucher Reward dari Supabase
export async function getVoucherCatalog(): Promise<RewardItem[]> {
  try {
    const { data, error } = await supabase
      .from('voucher_catalog')
      .select('id, title, category, cost_points, is_active')
      .eq('is_active', true)
      .order('cost_points', { ascending: true })

    if (error || !data || data.length === 0) {
      return DEFAULT_REWARDS
    }

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category as 'Koperasi' | 'Lingkungan',
      costPoints: item.cost_points,
      stock: 50,
      description: item.category === 'Koperasi'
        ? 'Dapat ditukarkan di Koperasi Sekolah'
        : 'Kontribusi penghijauan lingkungan sekolah'
    }))
  } catch {
    return DEFAULT_REWARDS
  }
}

// 3. Ambil Riwayat Transaksi dari Supabase
export async function getWasteDeposits(): Promise<WasteTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('waste_deposits')
      .select(`
        id,
        ref_code,
        weight_kg,
        points_awarded,
        status,
        deposited_at,
        material:waste_materials(code, name),
        user:profiles!waste_deposits_user_id_fkey(full_name, nis, class_name)
      `)
      .order('deposited_at', { ascending: false })
      .limit(30)

    if (error || !data || data.length === 0) {
      return []
    }

    return data.map((row) => {
      // User data jika ada
      const userObj = Array.isArray(row.user) ? row.user[0] : row.user
      const matObj = Array.isArray(row.material) ? row.material[0] : row.material

      const date = new Date(row.deposited_at)
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      return {
        id: row.ref_code || row.id,
        studentName: userObj?.full_name || 'Siswa Mandiri',
        studentNis: userObj?.nis ? `${userObj.nis} / ${userObj.class_name || ''}` : 'Umum',
        materialCode: matObj?.code || 'SAMPAH',
        materialName: matObj?.name || 'Material Daur Ulang',
        weightKg: Number(row.weight_kg),
        pointsAwarded: row.points_awarded,
        dateRecorded: `${formattedDate} WIB`,
        status: row.status === 'completed' ? 'Terverifikasi' : 'Menunggu Scan'
      }
    })
  } catch {
    return []
  }
}

// 4. Ambil Riwayat Voucher yang Ditukarkan
export async function getClaimedVouchers(): Promise<ClaimedVoucher[]> {
  try {
    const { data, error } = await supabase
      .from('voucher_claims')
      .select(`
        claim_code,
        points_spent,
        created_at,
        voucher:voucher_catalog(title)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error || !data || data.length === 0) {
      return []
    }

    return data.map((row) => {
      const vObj = Array.isArray(row.voucher) ? row.voucher[0] : row.voucher
      const date = new Date(row.created_at)
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      return {
        code: row.claim_code,
        title: vObj?.title || 'Voucher Reward',
        costPoints: row.points_spent,
        claimedAt: `${formattedDate} WIB`
      }
    })
  } catch {
    return []
  }
}
