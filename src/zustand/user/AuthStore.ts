import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from './User'

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  setUser: (userData: User) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const AuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      activeOffice: null,
      userOffices: [],
      user: null,
      token: null,

      login: (user, token) => {
        set({
          user: user,
          token,
        })
        const expirationDays = 30
        const expires = new Date(
          Date.now() + expirationDays * 86400000
        ).toUTCString()

        document.cookie = `token=${token}; path=/; expires=${expires}; SameSite=Lax`
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(user)
        )}; path=/; expires=${expires}; SameSite=Lax`
      },

      setUser: (userData) => {
        set({ user: userData })
        const expirationDays = 30
        const expires = new Date(
          Date.now() + expirationDays * 86400000
        ).toUTCString()
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(userData)
        )}; path=/; expires=${expires}; SameSite=Lax`
      },

      logout: () => {
        set({
          user: null,

          token: null,
        })
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
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)
