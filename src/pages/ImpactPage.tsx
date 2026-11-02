import { useData } from '../contexts/DataContext'

export function ImpactPage() {
  const { totalWeightKg, waterProtectedLiters, co2ReducedKg, transactions } =
    useData()

  return (
    <div className="max-w-4xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-white px-5 py-4">
          <span className="text-[11px] text-body">
            Air Bersih Terselamatkan
          </span>
          <p className="font-display text-2xl font-bold text-main mt-1">
            {waterProtectedLiters}{' '}
            <span className="text-xs font-normal text-muted">Liter</span>
          </p>
          <p className="text-[11px] text-body mt-1">
            Standar konservasi air dari sampah bersih terpilah
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white px-5 py-4">
          <span className="text-[11px] text-body">Pengurangan Emisi</span>
          <p className="font-display text-2xl font-bold text-main mt-1">
            {co2ReducedKg}{' '}
            <span className="text-xs font-normal text-muted">Kg CO₂</span>
          </p>
          <p className="text-[11px] text-body mt-1">
            Substitusi bahan baku baru dari material daur ulang
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white px-5 py-4">
          <span className="text-[11px] text-body">Sampah Terpilah</span>
          <p className="font-display text-2xl font-bold text-main mt-1">
            {totalWeightKg.toFixed(2)}{' '}
            <span className="text-xs font-normal text-muted">Kg</span>
          </p>
          <p className="text-[11px] text-body mt-1">
            Dari {transactions.length} total transaksi setoran di sekolah
          </p>
        </div>
      </div>
    </div>
  )
}
