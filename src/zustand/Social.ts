import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Social[]
  data: Social
  result: FetchResponse
}

export interface Social {
  _id: string
  name: string
  post: string
  socialType: string
  picture: string | File
  likes: number
  comments: number
  views: number
  url: string
  staffName: string
  createdAt: Date | null | number
  updatedAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const SocialEmpty = {
  _id: '',
  name: '',
  post: '',
  socialType: '',
  picture: '',
  likes: 0,
  views: 0,
  comments: 0,
  url: '',
  staffName: '',
  updatedAt: null,
  createdAt: null,
}

interface SocialState {
  count: number
  page_size: number
  socials: Social[]
  loading: boolean
  showSocialForm: boolean
  isAllChecked: boolean
  socialForm: Social
  setShowSocialForm: (status: boolean) => void
  resetForm: () => void
  setForm: (key: keyof Social, value: Social[keyof Social]) => void
  getSocials: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedSocials: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateSocial: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postSocial: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
}

const SocialStore = create<SocialState>((set) => ({
  count: 0,
  page_size: 0,
  socials: [],
  loading: false,
  showSocialForm: false,
  isAllChecked: false,
  socialForm: SocialEmpty,
  resetForm: () =>
    set({
      socialForm: SocialEmpty,
    }),
  setForm: (key, value) =>
    set((state) => ({
      socialForm: {
        ...state.socialForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Social) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        socials: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowSocialForm: (loadState: boolean) => {
    set({ showSocialForm: loadState })
  },

  getSocials: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: SocialStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        SocialStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      socials: state.socials.map((item: Social) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url,
    selectedSocials,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedSocials,
      setMessage,
      setLoading: SocialStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      SocialStore.getState().setProcessedResults(data)
    }
  },

  deleteItem: async (
    url,
    setMessage,
    setLoading
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data
    if (data) {
      SocialStore.getState().setProcessedResults(data)
    }
  },

  updateSocial: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: SocialStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        SocialStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postSocial: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: SocialStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        SocialStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.socials[index]?.isActive
      const updatedResults = state.socials.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        socials: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.socials.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )

      return {
        socials: updatedResults,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.socials.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.socials.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      return {
        socials: updatedResults,
        isAllChecked,
      }
    })
  },
}))

export default SocialStore
