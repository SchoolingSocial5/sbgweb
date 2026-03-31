import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from './zustand/user/User'

interface AuthState {
  user: User | null
  token: string | null
  login: (userData: User, token: string) => void
  setUser: (userData: User) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (userData, token) => {
        set({ user: userData, token })

        const expirationDays = 30
        const expires = new Date(
          Date.now() + expirationDays * 86400000
        ).toUTCString()

        document.cookie = `token=${token}; path=/; expires=${expires}; SameSite=Lax`
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(userData)
        )}; path=/; expires=${expires}; SameSite=Lax`
      },

      setUser: (userData) => {
        set({ user: userData })
      },

      logout: () => {
        set({ user: null, token: null })
        document.cookie =
          'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
        document.cookie =
          'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
      },

      isAuthenticated: () => {
        const { user, token } = get()
        return !!user && !!token
      },
    }),
    {
      name: 'auth-store', // key in localStorage
    }
  )
)
