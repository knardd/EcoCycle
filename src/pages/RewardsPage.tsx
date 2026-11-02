import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import type { RewardItem, ClaimedVoucher } from '../services/ecoCycleApi'
import { supabase } from '../lib/supabase'

export function RewardsPage() {
  const { user, profile, userBalance, refreshProfile } = useAuth()
  const {
    availableRewards,
    claimedVouchers,
    addClaimedVoucher,
    totalEarnedPoints,
    totalSpentPoints,
    currentPoolPoints,
    syncData
  } = useData()

  const isStudent = profile?.role === 'student'

  const handleClaimReward = useCallback(
    async (reward: RewardItem) => {
      // Klaim lewat Supabase RPC jika siswa login
      if (user && isStudent) {
        try {
          const { data, error } = await supabase.rpc('claim_voucher', {
            p_voucher_id: reward.id
          })
          if (error) {
            alert(`Gagal menukarkan voucher: ${error.message}`)
            return
          }
          alert(
            `Berhasil menukarkan "${data.voucher_title}"! Kode kupon Anda: ${data.claim_code}`
          )
          await refreshProfile()
          syncData()
          return
        } catch (err) {
          console.warn('Fallback ke claim lokal:', err)
        }
      }

      // Fallback demo lokal
      if (currentPoolPoints < reward.costPoints) {
        alert(
          `Poin belum mencukupi. Diperlukan ${reward.costPoints} poin, saldo aktif: ${currentPoolPoints} poin.`
        )
        return
      }

      const suffix = (Date.now() % 9000) + 1000
      const newVoucher: ClaimedVoucher = {
        code: `ECO-${reward.category.substring(0, 3).toUpperCase()}-${suffix}`,
        title: reward.title,
        costPoints: reward.costPoints,
        claimedAt: 'Baru saja'
      }

      addClaimedVoucher(newVoucher)
      alert(`Berhasil menukarkan "${reward.title}". Kode: ${newVoucher.code}`)
    },
    [user, isStudent, currentPoolPoints, refreshProfile, syncData, addClaimedVoucher]
  )

  return (
    <div className="max-w-4xl space-y-6">
      {/* 1. Bar Saldo Poin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line bg-white px-5 py-4 shadow-xs">
        <div>
          <span className="text-xs text-muted">
            {isStudent ? 'Saldo Poin Anda' : 'Total Saldo Beredar'}
          </span>
          <p className="font-display text-2xl font-extrabold text-brand mt-0.5">
            {(isStudent ? userBalance : currentPoolPoints).toLocaleString('id-ID')}{' '}
            <span className="text-sm font-normal text-muted">poin</span>
          </p>
        </div>
        <div className="text-xs text-muted sm:text-right">
          <span>Terbit: {totalEarnedPoints.toLocaleString('id-ID')}</span>
          <span className="mx-2">|</span>
          <span>Ditukar: {totalSpentPoints.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* 2. Katalog Reward */}
      <div className="rounded-xl border border-line bg-white shadow-xs divide-y divide-line">
        <div className="px-5 py-3">
          <h2 className="text-sm font-bold text-main">Katalog Pilihan Reward & Donasi</h2>
        </div>
        {availableRewards.map((rew) => (
          <div
            key={rew.id}
            className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold ${
                    rew.category === 'Lingkungan'
                      ? 'bg-brand-light text-brand-deep'
                      : 'bg-surface-subtle text-main'
                  }`}
                >
                  {rew.category}
                </span>
                <h3 className="text-sm font-semibold text-main truncate">
                  {rew.title}
                </h3>
              </div>
              <p className="text-xs text-muted mt-0.5">{rew.description}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="font-display text-base font-bold text-brand">
                  {rew.costPoints}
                </span>
                <span className="text-[11px] text-muted ml-1">poin</span>
              </div>
              <button
                onClick={() => handleClaimReward(rew)}
                disabled={
                  (isStudent ? userBalance : currentPoolPoints) < rew.costPoints
                }
                className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Tukar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Riwayat Penukaran */}
      {claimedVouchers.length > 0 && (
        <div className="rounded-xl border border-line bg-white shadow-xs">
          <div className="px-5 py-3 border-b border-line">
            <h3 className="text-sm font-bold text-main">
              Riwayat Penukaran ({claimedVouchers.length})
            </h3>
          </div>
          <div className="divide-y divide-line">
            {claimedVouchers.map((v, i) => (
              <div
                key={i}
                className="px-5 py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-main block">
                    {v.title}
                  </span>
                  <span className="font-mono text-brand text-[11px]">
                    {v.code}
                  </span>
                </div>
                <div className="text-right text-muted">
                  <span className="font-bold text-main">
                    -{v.costPoints} poin
                  </span>
                  <span className="block text-[10px]">{v.claimedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
