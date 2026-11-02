import { useState, useEffect } from 'react'
import { X, Calendar, Megaphone, AlertCircle } from 'lucide-react'

interface AnnouncementFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    date: string
    time: string
    location: string
    description: string
  }) => void
}

export function AnnouncementFormModal({
  isOpen,
  onClose,
  onSubmit
}: AnnouncementFormModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
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
    if (!title.trim() || !date || !time.trim() || !location.trim() || !description.trim()) {
      setErrorMsg('Semua kolom wajib diisi dengan lengkap.')
      return
    }

    onSubmit({
      title: title.trim(),
      date,
      time: time.trim(),
      location: location.trim(),
      description: description.trim()
    })

    // Reset & tutup
    setTitle('')
    setDate('')
    setTime('')
    setLocation('')
    setDescription('')
    setErrorMsg(null)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main/40 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-line shadow-xl overflow-hidden my-8 z-10">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-canvas/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-brand">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="announcement-form-title"
                className="font-display text-base font-bold text-main"
              >
                Buat Pengumuman Kegiatan
              </h2>
              <p className="text-[11px] text-muted">
                Informasikan jadwal kerja bakti, aksi lingkungan, atau gotong royong warga & siswa.
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

          <div>
            <label
              htmlFor="ann-title"
              className="block text-xs font-semibold text-main mb-1.5"
            >
              Judul Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              id="ann-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kerja Bakti Bersih Lingkungan & Kali Bersama"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-main focus:bg-white focus:border-brand focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ann-date"
                className="block text-xs font-semibold text-main mb-1.5"
              >
                Tanggal Pelaksanaan <span className="text-red-500">*</span>
              </label>
              <input
                id="ann-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-main focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="ann-time"
                className="block text-xs font-semibold text-main mb-1.5"
              >
                Waktu / Jam <span className="text-red-500">*</span>
              </label>
              <input
                id="ann-time"
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Contoh: 07:00 - 09:30 WIB"
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-main focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="ann-location"
              className="block text-xs font-semibold text-main mb-1.5"
            >
              Titik Kumpul / Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              id="ann-location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Halaman Depan Pos Bank Sampah"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-main focus:bg-white focus:border-brand focus:outline-hidden"
            />
          </div>

          <div>
            <label
              htmlFor="ann-description"
              className="block text-xs font-semibold text-main mb-1.5"
            >
              Deskripsi & Petunjuk Kegiatan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ann-description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan agenda aksi, perlengkapan yang dianjurkan (misal: botol minum/sarung tangan), dan rute kegiatan..."
              className="w-full rounded-lg border border-line bg-canvas p-3 text-sm text-main focus:bg-white focus:border-brand focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Form Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-body hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              Terbitkan Pengumuman
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
