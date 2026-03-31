import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'

interface FetchStaffsResponse {
  message: string
  count: number
  page_size: number
  results: Staff[]
}

export interface Staff {
  _id: string
  userId: string
  level: number
  email: string
  picture: string
  phone: string
  username: string
  firstName: string
  middleName: string
  lastName: string
  duties: string
  country: string
  countryFlag: string
  continent: string
  state: string
  area: string
  stateId: number
  salary: number
  position: string
  role: string
  isChecked?: boolean
  isActive?: boolean
}

interface StaffsState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  results: Staff[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Staff[]
  searchResult: Staff[]
  isAllChecked: boolean
  formData: Staff
  setForm: (key: keyof Staff, value: Staff[keyof Staff]) => void
  resetForm: () => void
  getItems: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchStaffsResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Staff[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const StaffStore = create<StaffsState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  results: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchResult: [],
  isAllChecked: false,
  formData: {
    _id: '',
    userId: '',
    level: 0,
    picture: '',
    email: '',
    phone: '',
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
    duties: '',
    country: '',
    countryFlag: '',
    continent: '',
    state: '',
    area: '',
    stateId: 0,
    salary: 0,
    position: '',
    role: '',
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
        level: 0,
        picture: '',
        userId: '',
        email: '',
        phone: '',
        username: '',
        firstName: '',
        middleName: '',
        lastName: '',
        duties: '',
        country: '',
        countryFlag: '',
        continent: '',
        state: '',
        area: '',
        stateId: 0,
        salary: 0,
        position: '',
        role: '',
      },
    }),

  setProcessedResults: ({ count, page_size, results }: FetchStaffsResponse) => {
    if (results) {
      const updatedResults = results.map((item: Staff) => ({
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

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getItems: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchStaffsResponse>(url, {
        setMessage,
        setLoading: StaffStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        StaffStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      results: state.results.map((item: Staff) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchStaffsResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Staff) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchResult: updatedResults })
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
    url: string,
    selectedItems: Staff[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchStaffsResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: StaffStore.getState().setLoading,
    })
    if (response) {
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchStaffsResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: StaffStore.getState().setLoading,
    })
    if (response) {
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchStaffsResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: StaffStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      StaffStore.getState().setProcessedResults(response.data)
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchStaffsResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: StaffStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      StaffStore.getState().setProcessedResults(response.data)
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

export default StaffStore
