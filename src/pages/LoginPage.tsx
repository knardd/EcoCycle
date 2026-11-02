import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Scale,
  Lock,
  Mail,
  User,
  Shield,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'
import { useAuth, type UserRole } from '../contexts/AuthContext'

export function LoginPage() {
  const { signIn, signUp, profile } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [nis, setNis] = useState('')
  const [className, setClassName] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) {
          setErrorMsg(
            error.message === 'Invalid login credentials'
              ? 'Email atau kata sandi tidak cocok'
              : error.message
          )
        } else {
          setSuccessMsg('Berhasil masuk! Mengarahkan...')
          setTimeout(() => {
            navigate(profile?.role === 'branch_staff' ? '/pos' : '/student')
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
          setSuccessMsg(
            'Akun berhasil terdaftar! Silakan login dengan email dan kata sandi Anda.'
          )
          setTimeout(() => {
            setMode('login')
            setSuccessMsg(null)
          }, 2000)
        }
      }
    } catch {
      setErrorMsg('Gagal terhubung ke layanan autentikasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <Scale className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-bold text-main">
            EcoCycle
          </span>
        </div>
        <h2 className="mt-4 text-center font-display text-xl font-bold tracking-tight text-main">
          {mode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun EcoCycle'}
        </h2>
        <p className="mt-1 text-center text-xs text-muted">
          Platform Bank Sampah Digital & Reward Lingkungan
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-line sm:rounded-2xl sm:px-10">
          {/* Tab Pilihan Masuk / Daftar */}
          <div className="flex rounded-lg bg-surface-subtle p-1 mb-6">
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
              Daftar Baru
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="mb-4 flex items-center gap-2 rounded-lg bg-brand-light border border-brand-subtle p-3 text-xs text-brand-deep"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-main mb-1.5">
                    Pilih Peran
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
                      placeholder="Nama lengkap sesuai data sekolah"
                      className="w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-xs text-main focus:bg-white focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
                    />
                  </div>
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-main mb-1.5">
                        NIS
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-xs"
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
        </div>
      </div>
    </div>
  )
}
