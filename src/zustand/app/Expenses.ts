import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Expenses[]
}

export interface Expenses {
  _id: string
  name: string
  amount: number
  receipt: File | string
  description: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}

interface ExpensesState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  results: Expenses[]
  uploads: Expenses[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Expenses[]
  searchResult: Expenses[]
  searchedResults: Expenses[]
  isAllChecked: boolean
  formData: Expenses
  setForm: (key: keyof Expenses, value: Expenses[keyof Expenses]) => void
  resetForm: () => void
  getItems: (url: string) => Promise<void>
  getUploads: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setProcessedUploads: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Expenses[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const ExpensesStore = create<ExpensesState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  results: [],
  uploads: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchResult: [],
  searchedResults: [],
  isAllChecked: false,
  formData: {
    _id: '',
    name: '',
    amount: 0,
    receipt: '',
    description: '',
    createdAt: null,
  },
  setForm: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      formData: {
        _id: '',
        name: '',
        amount: 0,
        receipt: '',
        description: '',
        createdAt: null,
      },
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Expenses) => ({
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

  setProcessedUploads: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Expenses) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        uploads: updatedResults,
      })
    }
  },

  getItems: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExpensesStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ExpensesStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getUploads: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExpensesStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ExpensesStore.getState().setProcessedUploads(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      results: state.results.map((item: Expenses) => ({
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
        const updatedResults = results.map((item: Expenses) => ({
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

  massDelete: async (url, selectedItems, setMessage) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: ExpensesStore.getState().setLoading,
    })
    const data = response.data
    if (data) {
    }
  },

  deleteItem: async (url, setMessage) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: ExpensesStore.getState().setLoading,
    })
    if (response) {
      console.log(response)
    }
  },

  updateItem: async (url, updatedItem, setMessage) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: ExpensesStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false, error: null })
      ExpensesStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false, error: null })
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: ExpensesStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false, error: null })
      ExpensesStore.getState().setProcessedResults(response.data)
    } else {
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

export default ExpensesStore
