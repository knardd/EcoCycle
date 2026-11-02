import { useState, useEffect } from 'react'
import { X, Lock, Mail, User, Shield, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth, type UserRole } from '../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [nis, setNis] = useState('')
  const [className, setClassName] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) {
          setErrorMsg(error.message === 'Invalid login credentials' 
            ? 'Email atau kata sandi tidak sesuai' 
            : error.message)
        } else {
          setSuccessMsg('Berhasil masuk!')
          setTimeout(() => {
            onClose()
          }, 800)
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Nama lengkap wajib diisi')
          setLoading(false)
          return
        }

        const { error } = await signUp({
          email,
          password,
          fullName: fullName.trim(),
          role,
          nis: role === 'student' ? nis.trim() : undefined,
          className: role === 'student' ? className.trim() : undefined
        })

        if (error) {
          setErrorMsg(error.message)
        } else {
          setSuccessMsg('Akun berhasil didaftarkan! Silakan cek email Anda untuk verifikasi atau langsung login.')
          setTimeout(() => {
            setMode('login')
            setSuccessMsg(null)
          }, 2000)
        }
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi autentikasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main/50 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-line relative"
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute top-4 right-4 rounded-lg p-1.5 text-muted hover:bg-surface-subtle hover:text-main transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Modal */}
        <div className="text-center mb-6">
          <h2 id="auth-modal-title" className="font-display text-xl font-bold text-main">
            {mode === 'login' ? 'Masuk ke EcoCycle' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-xs text-muted mt-1">
            {mode === 'login'
              ? 'Kelola setoran sampah dan poin reward Anda'
              : 'Pilih peran dan lengkapi data untuk mulai memilah'}
          </p>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="flex rounded-lg bg-surface-subtle p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-brand shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-brand shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-brand-light border border-brand-subtle p-3 text-xs text-brand-deep">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {/* Pilihan Peran */}
              <div>
                <label className="block text-xs font-semibold text-main mb-1.5">
                  Peran Pengguna
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-xs font-semibold transition-all cursor-pointer ${
                      role === 'student'
                        ? 'border-brand bg-brand-light/40 text-brand'
                        : 'border-line text-muted hover:bg-canvas'
                    }`}
                  >
                    <GraduationCap className="h-4 w-4" />
                    Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('branch_staff')}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-xs font-semibold transition-all cursor-pointer ${
                      role === 'branch_staff'
                        ? 'border-brand bg-brand-light/40 text-brand'
                        : 'border-line text-muted hover:bg-canvas'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Petugas Pos
                  </button>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-main mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-xs text-main focus:bg-white focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
                  />
                </div>
              </div>

              {/* Form Tambahan untuk Siswa */}
              {role === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-main mb-1.5">
                      NIS Siswa
                    </label>
                    <input
                      type="text"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      placeholder="8492"
                      className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-main focus:bg-white focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-main mb-1.5">
                      Kelas
                    </label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="8A"
                      className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-main focus:bg-white focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Alamat Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
                className="w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-xs text-main focus:bg-white focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-xs text-main focus:bg-white focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : mode === 'login' ? (
              'Masuk Sekarang'
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-5 text-center text-[11px] text-muted">
          {mode === 'login' ? (
            <span>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setErrorMsg(null)
                }}
                className="font-semibold text-brand hover:underline cursor-pointer"
              >
                Daftar di sini
              </button>
            </span>
          ) : (
            <span>
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setErrorMsg(null)
                }}
                className="font-semibold text-brand hover:underline cursor-pointer"
              >
                Masuk ke akun
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
