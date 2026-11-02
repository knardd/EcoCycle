import { useData } from '../contexts/DataContext'

export function CatalogPage() {
  const { categories } = useData()

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-subtle text-[11px] text-muted font-semibold uppercase tracking-wider">
              <th scope="col" className="py-2.5 px-5">
                Kode
              </th>
              <th scope="col" className="py-2.5 px-5">
                Material
              </th>
              <th scope="col" className="py-2.5 px-5">
                Kategori
              </th>
              <th scope="col" className="py-2.5 px-5 text-right">
                Poin / Kg
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {categories.map((cat) => (
              <tr
                key={cat.code}
                className="hover:bg-canvas transition-colors group"
              >
                <td className="py-3 px-5 font-mono text-xs font-bold text-brand">
                  {cat.code}
                </td>
                <td className="py-3 px-5">
                  <span className="font-semibold text-main text-sm">
                    {cat.name}
                  </span>
                  <span className="block text-[11px] text-muted mt-0.5 max-w-xs">
                    {cat.specification}
                  </span>
                </td>
                <td className="py-3 px-5 text-xs text-muted">{cat.type}</td>
                <td className="py-3 px-5 text-right">
                  <span className="font-display text-base font-bold text-main">
                    {cat.pointsPerKg}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
