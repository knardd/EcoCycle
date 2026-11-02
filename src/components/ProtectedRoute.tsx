import { Navigate } from 'react-router-dom'
import { useAuth, type UserRole } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { profile } = useAuth()

  // Jika ada pembatasan peran dan peran pengguna tidak cocok
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Alihkan siswa yang mencoba buka halaman staf ke dashboard siswa
    if (profile.role === 'student') {
      return <Navigate to="/student" replace />
    }
    // Alihkan staf yang mencoba buka dashboard siswa ke pos
    return <Navigate to="/pos" replace />
  }

  return <>{children}</>
}
