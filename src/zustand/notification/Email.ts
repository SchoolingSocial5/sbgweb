import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import axios, { AxiosError } from 'axios'

export interface Email {
  _id: string
  picture: string | File | null
  title: string
  name: string
  content: string
  sendable: boolean
  greetings: string
  isChecked?: boolean
  isActive?: boolean
}

export const EmailEmpty = {
  _id: '',
  picture: '',
  title: '',
  name: '',
  content: '',
  sendable: false,
  greetings: '',
}

interface FetchEmailResponse {
  message: string
  count: number
  page_size: number
  results: Email[]
}

interface EmailsState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  results: Email[]
  socialEmails: Email[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Email[]
  searchResult: Email[]
  searchedResults: Email[]
  isAllChecked: boolean
  isEmailForm: boolean
  emailForm: Email
  setForm: (key: keyof Email, value: Email[keyof Email]) => void
  resetForm: () => void
  getItems: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getSocialEmails: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  sendUsersEmail: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  getEmail: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchEmailResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const EmailStore = create<EmailsState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  results: [],
  socialEmails: [],
  loading: false,
  isEmailForm: false,
  error: null,
  selectedItems: [],
  searchResult: [],
  searchedResults: [],
  isAllChecked: false,
  emailForm: EmailEmpty,
  setForm: (key, value) =>
    set((state) => ({
      emailForm: {
        ...state.emailForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      emailForm: EmailEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchEmailResponse) => {
    if (results) {
      const updatedResults = results.map((item: Email) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        results: updatedResults,
      })
    }
  },

  sendUsersEmail: async (url, updatedItem, setMessage) => {
    try {
      await apiRequest<FetchEmailResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: EmailStore.getState().setLoading,
      })

    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getSocialEmails: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchEmailResponse>(url, {
        setMessage,
        setLoading: EmailStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ socialEmails: data.results })
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getItems: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchEmailResponse>(url, {
        setLoading: EmailStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        EmailStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setMessage(error.response.data.message, false)
      } else {
        console.error('Failed to fetch staff:', error)
        setMessage('An unexpected error occurred.', false)
      }
    }
  },

  getEmail: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchEmailResponse>(url, {
        setLoading: EmailStore.getState().setLoading,
        setMessage,
      })
      const data = response?.data
      if (data) {
        console.log(data)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      results: state.results.map((item: Email) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchEmailResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Email) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedResults: updatedResults })
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        set({
          error: error.message || 'Failed to search items',
          loading: false,
        })
      } else {
        set({
          error: 'Failed to search items',
          loading: false,
        })
      }
    }
  }, 1000),

  massDelete: async (
    url,
    selectedItems,
    setMessage
  ) => {
    try {
      set({ loading: true, })
      const response = await apiRequest<FetchEmailResponse>(url, {
        method: 'PATCH',
        body: selectedItems,
        setMessage,
      })
      const data = response?.data
      if (data && data.results) {
        EmailStore.getState().setProcessedResults(data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false, })
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    await apiRequest<FetchEmailResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: EmailStore.getState().setLoading,
    })
  },

  updateItem: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchEmailResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: EmailStore.getState().setLoading,
    })
    if (response?.data) {
      set({ loading: false })
      EmailStore.getState().setProcessedResults(response.data)
      if (redirect) redirect()
    } else {
      set({ loading: false })
    }
  },

  postItem: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchEmailResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: EmailStore.getState().setLoading,
    })
    if (response?.data) {
      set({ loading: false })
      EmailStore.getState().setProcessedResults(response.data)
      if (redirect) redirect()
    } else {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.results[index]?.isActive
      const updatedResults = state.results.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        results: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.results.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        results: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.results.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.results.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        results: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default EmailStore
