import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Place[]
}

export interface Place {
  _id: string
  id: string
  continent: string
  country: string
  countryCode: string
  countryFlag: string | null | File
  state: string
  area: string
  landmark: string
  zipCode: string
  countrySymbol: string
  currency: string
  currencySymbol: string
  stateCapital: string
  stateLogo: string
  isChecked?: boolean
  isActive?: boolean
}

export const PlaceEmpty = {
  _id: '',
  id: '',
  continent: '',
  country: '',
  countryCode: '',
  countryFlag: '',
  state: '',
  area: '',
  landmark: '',
  zipCode: '',
  countrySymbol: '',
  currency: '',
  currencySymbol: '',
  stateCapital: '',
  stateLogo: '',
  isChecked: false,
  isActive: false,
}

interface PlaceState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  itemResults: Place[]
  loadingPlaces: boolean
  error: string | null
  successs?: string | null
  selectedItems: Place[]
  searchedItems: Place[]
  isAllChecked: boolean
  itemFormData: Place
  setItemForm: (key: keyof Place, value: Place[keyof Place]) => void
  resetForm: () => void
  getItems: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Place[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const PlaceStore = create<PlaceState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  itemResults: [],
  loadingPlaces: false,
  error: null,
  selectedItems: [],
  searchedItems: [],
  isAllChecked: false,
  itemFormData: PlaceEmpty,
  setItemForm: (key, value) =>
    set((state) => ({
      itemFormData: {
        ...state.itemFormData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      itemFormData: PlaceEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Place) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        itemResults: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingPlaces: loadState })
  },

  getItems: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: PlaceStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        PlaceStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      itemResults: state.itemResults.map((item: Place) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: PlaceStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedItems: results })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Place[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: PlaceStore.getState().setLoading,
    })
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data
    if (data) {
      PlaceStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loadingPlaces: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: PlaceStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      PlaceStore.getState().setProcessedResults(data)
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loadingPlaces: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: PlaceStore.getState().setLoading,
    })
    const data = response?.data

    if (data) {
      PlaceStore.getState().setProcessedResults(data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.itemResults[index]?.isActive
      const updatedResults = state.itemResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        itemResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.itemResults.map((tertiary, idx) =>
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
        itemResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.itemResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.itemResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        itemResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default PlaceStore
