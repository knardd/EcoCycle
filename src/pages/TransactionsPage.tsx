import { useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { useData } from '../contexts/DataContext'

export function TransactionsPage() {
  const { transactions, deleteTransaction } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTransactions = transactions.filter(
    (t) =>
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.studentNis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIS, atau kode transaksi..."
            className="w-full rounded-lg border border-line bg-white pl-9 pr-3 py-2 text-xs text-main focus:border-brand focus:outline-hidden"
          />
        </div>
        <div className="text-xs text-muted">
          Menampilkan{' '}
          <span className="font-bold text-main">
            {filteredTransactions.length}
          </span>{' '}
          transaksi
        </div>
      </div>

      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-line bg-surface-subtle text-muted font-semibold">
              <th className="py-3 px-4">Ref ID</th>
              <th className="py-3 px-4">Siswa</th>
              <th className="py-3 px-4">Material</th>
              <th className="py-3 px-4 text-right">Berat (Kg)</th>
              <th className="py-3 px-4 text-right">Poin</th>
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="font-semibold text-sm text-main">
                      Tidak ada transaksi ditemukan
                    </span>
                    <span className="text-xs text-body">
                      {searchQuery
                        ? `Tidak ada data yang cocok dengan kata kunci "${searchQuery}"`
                        : 'Belum ada catatan transaksi setoran sampah'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-canvas">
                  <td className="py-3 px-4 font-mono font-bold text-brand">
                    {tx.id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-main block">
                      {tx.studentName}
                    </span>
                    <span className="text-[10px] text-body">
                      {tx.studentNis}
                    </span>
                  </td>
                  <td className="py-3 px-4">{tx.materialName}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {tx.weightKg.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-brand">
                    +{tx.pointsAwarded}
                  </td>
                  <td className="py-3 px-4 text-body text-[11px]">
                    {tx.dateRecorded}
                  </td>
                  <td className="py-1 px-4 text-center">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus transaksi"
                      aria-label={`Hapus transaksi ${tx.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
