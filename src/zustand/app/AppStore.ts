import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  count: number
  message: string
  page_size: number
  data: App
}

export const AppEmpty = {
  _id: '',
  name: '',
  domain: '',
  finalInstruction: '',
  email: '',
  documents: '',
  phone: '',
  allowSignup: false,
  headquaters: '',
  newVersion: '',
  newVersionLink: '',
}

interface AppState {
  appForm: App
  loading: boolean
  getApp: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  resetForm: () => void
  updateApp: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
}

export const AppStore = create<AppState>((set) => ({
  appForm: AppEmpty,
  loading: false,

  getApp: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        set({
          appForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  resetForm: () =>
    set({
      appForm: AppEmpty,
    }),

  updateApp: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    const data = response?.data
    if (data) {
      set({ appForm: data.data })
    }
  },
}))

export interface App {
  _id: string
  name: string
  domain: string
  finalInstruction: string
  email: string
  documents: string
  phone: string
  allowSignup: boolean
  headquaters: string
  newVersion: string
  newVersionLink: string
}
