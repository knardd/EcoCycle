import { useState, useEffect } from 'react'
import { X, Send, Sparkles, AlertCircle } from 'lucide-react'
import type { EduArticle } from '../types/education'

interface ArticleFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    category: EduArticle['category']
    content: string
    summary: string
  }) => void
}

const CATEGORIES: EduArticle['category'][] = [
  'Plastik',
  'Kertas & Kardus',
  'Minyak Jelantah',
  'Kompos',
  'Kreasi Kriya'
]

export function ArticleFormModal({
  isOpen,
  onClose,
  onSubmit
}: ArticleFormModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EduArticle['category']>('Kreasi Kriya')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !summary.trim() || !content.trim()) {
      setErrorMsg('Semua kolom wajib diisi dengan lengkap.')
      return
    }

    onSubmit({
      title: title.trim(),
      category,
      summary: summary.trim(),
      content: content.trim()
    })

    // Reset dan tutup
    setTitle('')
    setSummary('')
    setContent('')
    setErrorMsg(null)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main/40 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-line shadow-xl overflow-hidden my-8 z-10">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-canvas/40">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="article-form-title"
                className="font-display text-base font-bold text-main"
              >
                Tulis Ide & Kreasi Daur Ulang
              </h2>
              <p className="text-[11px] text-muted">
                Bagikan pengalaman, kreasi kriya, atau tips pemilahan sampahmu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup form"
            className="rounded-lg p-1.5 text-muted hover:bg-surface-subtle hover:text-main transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Moderasi */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Catatan Persetujuan:</span>
            Naskah yang kamu kirim akan diperiksa oleh guru atau petugas pos. Poin reward <strong>+50 Poin</strong> akan dicairkan ke akunmu pada hari naskah disetujui.
          </div>

          <div>
            <label
              htmlFor="article-title"
              className="block text-xs font-semibold text-main mb-1.5"
            >
              Judul Karya / Tips <span className="text-red-500">*</span>
            </label>
            <input
              id="article-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Membuat Rak Buku Dinding dari Kardus Sepatu"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-main focus:bg-white focus:border-brand focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Kategori Sampah <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-brand text-white border-brand'
                        : 'bg-canvas text-body border-line hover:bg-surface-subtle'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="article-summary"
              className="block text-xs font-semibold text-main mb-1.5"
            >
              Ringkasan Singkat <span className="text-red-500">*</span>
            </label>
            <input
              id="article-summary"
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Jelaskan dalam 1-2 kalimat apa yang kamu buat atau pelajari"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-main focus:bg-white focus:border-brand focus:outline-hidden"
            />
          </div>

          <div>
            <label
              htmlFor="article-content"
              className="block text-xs font-semibold text-main mb-1.5"
            >
              Isi Naskah / Langkah-Langkah Pembuatan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="article-content"
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan alat dan bahan yang dibutuhkan, serta langkah-langkah pembuatannya secara berurutan..."
              className="w-full rounded-lg border border-line bg-canvas p-3 text-sm text-main focus:bg-white focus:border-brand focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Form Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2.5 text-xs font-semibold text-body hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer flex items-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim untuk Dimoderasi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
