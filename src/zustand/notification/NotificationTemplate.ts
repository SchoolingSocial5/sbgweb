import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: NotificationTemplate[]
  data: NotificationTemplate
  result: FetchResponse
}

export interface NotificationTemplate {
  _id: string
  title: string
  name: string
  content: string
  greetings: string
  isChecked?: boolean
  isActive?: boolean
}

export const NotificationTemplateEmpty = {
  _id: '',
  title: '',
  name: '',
  content: '',
  greetings: '',
}

interface NotificationTemplateState {
  links: { next: string | null; previous: string | null } | null
  count: number
  currentPage: number
  page_size: number
  results: NotificationTemplate[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: NotificationTemplate[]
  searchResult: NotificationTemplate[]
  searchedResults: NotificationTemplate[]
  isNoteForm: boolean
  isAllChecked: boolean
  formData: NotificationTemplate
  setForm: (
    key: keyof NotificationTemplate,
    value: NotificationTemplate[keyof NotificationTemplate]
  ) => void
  resetForm: () => void
  getItems: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    showTemplate?: () => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
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

const NotificationTemplateStore = create<NotificationTemplateState>((set) => ({
  links: null,
  count: 0,
  currentPage: 1,
  page_size: 20,
  results: [],
  loading: false,
  isNoteForm: false,
  error: null,
  selectedItems: [],
  searchResult: [],
  searchedResults: [],
  isAllChecked: false,
  formData: NotificationTemplateEmpty,
  setForm: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      formData: NotificationTemplateEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: NotificationTemplate) => ({
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

  getItems: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: NotificationTemplateStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        NotificationTemplateStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getItem: async (url, setMessage, showTemplate) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: NotificationTemplateStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          formData: data.data,
          loading: false,
        })
      }
      if (showTemplate) showTemplate()
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      results: state.results.map((item: NotificationTemplate) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: NotificationTemplate) => ({
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
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: selectedItems,
        setMessage,
        setLoading: NotificationTemplateStore.getState().setLoading,
      })
      if (response?.data) {
        NotificationTemplateStore.getState().setProcessedResults(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  deleteItem: async (url, setMessage) => {
    try {
      set({
        loading: true,
      })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'DELETE',
        setMessage,
      })
      const data = response.data
      if (data) {
        NotificationTemplateStore.getState().setProcessedResults(data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({
        loading: false,
      })
    }
  },

  updateItem: async (url, updatedItem, setMessage, redirect) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: NotificationTemplateStore.getState().setLoading,
      })
      if (response?.data) {
        NotificationTemplateStore.getState().setProcessedResults(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postItem: async (url, updatedItem, setMessage, redirect) => {
    try {
      set({ loading: true, error: null })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: NotificationTemplateStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        NotificationTemplateStore.getState().setProcessedResults(data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false, error: null })
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

export default NotificationTemplateStore
