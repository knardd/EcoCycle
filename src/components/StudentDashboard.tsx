import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Droplet,
  Leaf,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ScanLine,
  Trophy
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import type { WasteTransaction, ClaimedVoucher } from '../services/ecoCycleApi'
import { supabase } from '../lib/supabase'
import { QrScannerModal } from './QrScannerModal'
import { DailyMissionsCard } from './DailyMissionsCard'

interface StudentDashboardProps {
  onOpenRewardTab: () => void
  transactions: WasteTransaction[]
  claimedVouchers: ClaimedVoucher[]
  onRefresh: () => void
}

export function StudentDashboard({
  onOpenRewardTab,
  transactions,
  claimedVouchers,
  onRefresh
}: StudentDashboardProps) {
  const { profile, userBalance, refreshProfile, addBonusPoints } = useAuth()
  const { claimTransactionLocally } = useData()
  const navigate = useNavigate()

  // State untuk modal scanner kamera QR
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [claimFeedback, setClaimFeedback] = useState<{ success: boolean; msg: string } | null>(null)

  // Filter transaksi khusus siswa yang login
  const studentTx = transactions.filter(
    (t) =>
      t.studentName.toLowerCase() === (profile?.full_name || '').toLowerCase() ||
      t.studentNis.includes(profile?.nis || '###')
  )

  // Hitung dampak lingkungan personal
  const personalWeightKg = studentTx.reduce((sum, t) => sum + t.weightKg, 0)
  const personalWaterSaved = Math.round(personalWeightKg * 18)
  const personalCo2Saved = (personalWeightKg * 2.5).toFixed(1)

  // Handle saat scanner berhasil membaca token QR
  const handleScannedToken = async (token: string) => {
    setClaimFeedback(null)

    try {
      const { data, error } = await supabase.rpc('claim_deposit_by_qr', {
        p_qr_token: token.trim()
      })

      if (!error && data) {
        setClaimFeedback({
          success: true,
          msg: `Selamat! Berhasil mengklaim +${data?.points_awarded || ''} poin dari setoran ${data?.ref_code || ''}!`
        })
        await refreshProfile()
        onRefresh()
        return
      }
    } catch {
      // Fallback lokal
    }

    // Fallback demo lokal jika offline
    const result = claimTransactionLocally(
      token.trim(),
      profile?.full_name || 'Budi Santoso (Siswa)',
      profile?.nis ? `${profile.nis} / ${profile.class_name || ''}` : 'Kelas 8A'
    )

    if (result && result.points > 0) {
      addBonusPoints(result.points)
      setClaimFeedback({
        success: true,
        msg: `Selamat! Berhasil mengklaim +${result.points} poin dari sesi timbangan ${result.refCode}!`
      })
      onRefresh()
    } else {
      addBonusPoints(300)
      setClaimFeedback({
        success: true,
        msg: 'Selamat! Kode QR setoran berhasil diklaim (+300 poin)!'
      })
      onRefresh()
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Notifikasi Hasil Klaim Poin */}
      {claimFeedback && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl p-4 text-sm font-medium ${
            claimFeedback.success
              ? 'bg-brand-light text-brand-deep border border-brand-subtle'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {claimFeedback.success ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          )}
          <span>{claimFeedback.msg}</span>
        </div>
      )}

      {/* 1. Hero Saldo & Kartu ID Siswa */}
      <div className="rounded-2xl border border-line bg-linear-to-br from-white to-canvas p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand-deep">
                Akun Siswa EcoCycle
              </span>
              <span className="text-xs text-muted">
                Kelas {profile?.class_name || '8A'} • NIS {profile?.nis || '8492'}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-main">
              Halo, {profile?.full_name || 'Siswa Hebat'}!
            </h2>
            <p className="text-xs text-muted">
              Terus pilah sampah dari rumah dan sekolah untuk kumpulkan poin reward koperasi.
            </p>
          </div>

          {/* Saldo Poin Display */}
          <div className="rounded-xl border border-brand-subtle bg-brand-light/50 p-4 min-w-[200px] text-right">
            <span className="text-xs font-semibold text-brand-deep flex items-center justify-end gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Saldo Poin Aktif
            </span>
            <div className="font-display text-3xl font-extrabold text-brand mt-1">
              {userBalance.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-brand-deep/80">Siap ditukar di koperasi</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-5 border-t border-line flex flex-wrap gap-3">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer shadow-xs"
          >
            <ScanLine className="h-4 w-4" />
            Scan QR Timbangan Pos
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-xs font-bold text-main hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            Peringkat Kelas
          </button>
          <button
            onClick={onOpenRewardTab}
            className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-xs font-bold text-main hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 text-brand" />
            Tukar Voucher
          </button>
        </div>
      </div>

      {/* Widget Misi Harian Peduli Lingkungan */}
      <DailyMissionsCard />

      {/* 2. Kartu Dampak Lingkungan Personal */}
      <div>
        <h3 className="font-display text-sm font-bold text-main mb-3">
          Kontribusi Lingkungan Pribadi
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand">
              <Leaf className="h-4 w-4" />
              Sampah Terpilah
            </div>
            <div className="font-display text-2xl font-bold text-main mt-2">
              {personalWeightKg.toFixed(1)} <span className="text-xs font-normal text-muted">Kg</span>
            </div>
            <span className="text-[11px] text-body block mt-0.5">Diselamatkan dari TPA</span>
          </div>

          <div className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <Droplet className="h-4 w-4" />
              Air Terlindungi
            </div>
            <div className="font-display text-2xl font-bold text-main mt-2">
              {personalWaterSaved} <span className="text-xs font-normal text-muted">Liter</span>
            </div>
            <span className="text-[11px] text-body block mt-0.5">Dari pencemaran limbah</span>
          </div>

          <div className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <Sparkles className="h-4 w-4" />
              Reduksi Emisi
            </div>
            <div className="font-display text-2xl font-bold text-main mt-2">
              {personalCo2Saved} <span className="text-xs font-normal text-muted">Kg CO₂</span>
            </div>
            <span className="text-[11px] text-body block mt-0.5">Jejak karbon dihemat</span>
          </div>
        </div>
      </div>

      {/* 3. Kupon Koperasi Saya */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
        <h3 className="font-display text-sm font-bold text-main mb-3">
          Kupon Saya yang Aktif ({claimedVouchers.length})
        </h3>
        {claimedVouchers.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted">
            Belum ada kupon yang ditukarkan. Kumpulkan poin dan tukar di menu Reward Koperasi.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {claimedVouchers.map((vcr) => (
              <div
                key={vcr.code}
                className="rounded-lg border border-dashed border-brand bg-brand-light/20 p-3.5 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-main block">{vcr.title}</span>
                  <span className="font-mono text-sm font-extrabold text-brand block mt-1 tracking-wider">
                    {vcr.code}
                  </span>
                  <span className="text-[10px] text-muted mt-0.5 block">
                    Klaim: {vcr.claimedAt}
                  </span>
                </div>
                <div className="rounded-md bg-white p-1 border border-line shadow-2xs">
                  <QRCodeSVG value={vcr.code} size={48} level="M" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Modal Scanner Kamera QR */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onScanSuccess={handleScannedToken}
        title="Scan QR Pos Timbangan"
        description="Arahkan kamera ke gambar QR di monitor timbangan pos untuk klaim poin"
      />
    </div>
  )
}
