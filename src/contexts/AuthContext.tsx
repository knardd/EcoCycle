import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type UserRole = 'student' | 'branch_staff' | 'school_admin' | 'platform_admin' | 'community_member'

export interface UserProfile {
  id: string
  school_id: string | null
  role: UserRole
  full_name: string
  nis: string | null
  class_name: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  userBalance: number
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (params: {
    email: string
    password: string
    fullName: string
    role: UserRole
    nis?: string
    className?: string
    schoolId?: string
  }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  switchMockRole: (role: UserRole) => void
  addBonusPoints: (points: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userBalance, setUserBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Ambil profil dari tabel profiles dan saldo poin
  const fetchProfileAndBalance = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profileError && profileData) {
        setProfile(profileData as UserProfile)
      } else {
        // Fallback jika profile belum dibuat trigger
        setProfile({
          id: userId,
          school_id: null,
          role: 'student',
          full_name: 'Pengguna EcoCycle',
          nis: null,
          class_name: null
        })
      }

      // Ambil saldo poin via RPC
      const { data: balanceData } = await supabase.rpc('get_user_point_balance', {
        p_user_id: userId
      })
      if (typeof balanceData === 'number') {
        setUserBalance(balanceData)
      }
    } catch (err) {
      console.warn('Gagal memuat profil Supabase:', err)
    }
  }

  useEffect(() => {
    // 1. Cek sesi aktif saat pertama kali load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndBalance(session.user.id)
      }
      setIsLoading(false)
    })

    // 2. Pasang pendengar perubahan autentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndBalance(session.user.id)
      } else {
        setProfile(null)
        setUserBalance(0)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (!error && data.user) {
      await fetchProfileAndBalance(data.user.id)
    }
    return { error }
  }

  const signUp = async (params: {
    email: string
    password: string
    fullName: string
    role: UserRole
    nis?: string
    className?: string
    schoolId?: string
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          role: params.role,
          school_id: params.schoolId || 'a0000000-0000-0000-0000-000000000001',
          nis: params.nis || null,
          class_name: params.className || null
        }
      }
    })

    if (!error && data.user) {
      await fetchProfileAndBalance(data.user.id)
    }
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setUserBalance(0)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndBalance(user.id)
    }
  }

  // Helper untuk kemudahan demo saat testing lokal (mengubah role sementara)
  const switchMockRole = (role: UserRole) => {
    if (profile) {
      setProfile({ ...profile, role })
    } else {
      setProfile({
        id: 'mock-user-id',
        school_id: 'a0000000-0000-0000-0000-000000000001',
        role,
        full_name: role === 'student' ? 'Budi Santoso (Siswa)' : 'Ibu Siti (Petugas Pos)',
        nis: role === 'student' ? '8492' : null,
        class_name: role === 'student' ? '8A' : null
      })
    }
  }

  const addBonusPoints = (points: number) => {
    setUserBalance((prev) => prev + points)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        userBalance,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        switchMockRole,
        addBonusPoints
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
