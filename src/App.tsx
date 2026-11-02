import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { StudentPage } from './pages/StudentPage'
import { PosPage } from './pages/PosPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { RewardsPage } from './pages/RewardsPage'
import { ImpactPage } from './pages/ImpactPage'
import { CatalogPage } from './pages/CatalogPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { EducationPage } from './pages/EducationPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function RootRedirect() {
  const { profile } = useAuth()
  if (
    profile?.role === 'branch_staff' ||
    profile?.role === 'school_admin' ||
    profile?.role === 'platform_admin'
  ) {
    return <Navigate to="/pos" replace />
  }
  return <Navigate to="/student" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Halaman Login & Registrasi Khusus */}
            <Route path="/login" element={<LoginPage />} />

            {/* Layout Utama dengan Sidebar & Header */}
            <Route path="/" element={<Layout />}>
              <Route index element={<RootRedirect />} />

              {/* Rute Siswa */}
              <Route
                path="student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentPage />
                  </ProtectedRoute>
                }
              />

              {/* Rute Staf Pos */}
              <Route
                path="pos"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'branch_staff',
                      'school_admin',
                      'platform_admin'
                    ]}
                  >
                    <PosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="transactions"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'branch_staff',
                      'school_admin',
                      'platform_admin'
                    ]}
                  >
                    <TransactionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="catalog"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'branch_staff',
                      'school_admin',
                      'platform_admin'
                    ]}
                  >
                    <CatalogPage />
                  </ProtectedRoute>
                }
              />

              {/* Rute Bersama (Bisa Diakses Siswa Maupun Staf) */}
              <Route path="education" element={<EducationPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="impact" element={<ImpactPage />} />

              {/* Fallback Jika URL Tidak Ditemukan */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
