import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'
import apiRequest from '@/lib/axios'

interface FetchPositionResponse {
  message: string
  count: number
  page_size: number
  results: Position[]
}

export interface Position {
  _id: string
  level: number
  position: string
  duties: string
  salary: number
  role: string
  isChecked?: boolean
  isActive?: boolean
}

export const PositionEmpty = {
  _id: '',
  level: 0,
  salary: 0,
  position: '',
  duties: '',
  role: '',
}

interface PositionsState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  positionResults: Position[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Position[]
  searchedPositions: Position[]
  isAllChecked: boolean
  showPosition: boolean
  positionFormData: Position
  setPositionForm: (
    key: keyof Position,
    value: Position[keyof Position]
  ) => void
  resetForm: () => void
  getPositions: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchPositionResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
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
  searchPosition: (url: string) => void
}

const PositionStore = create<PositionsState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  positionResults: [],
  loading: false,
  showPosition: false,
  error: null,
  selectedItems: [],
  searchedPositions: [],
  isAllChecked: false,
  positionFormData: PositionEmpty,
  setPositionForm: (key, value) =>
    set((state) => ({
      positionFormData: {
        ...state.positionFormData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      positionFormData: PositionEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({
    count,
    page_size,
    results,
  }: FetchPositionResponse) => {
    if (results) {
      const updatedResults = results.map((item: Position) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        positionResults: updatedResults,
      })
    }
  },

  getPositions: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchPositionResponse>(url, {
        setMessage,
        setLoading: PositionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        PositionStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      positionResults: state.positionResults.map((item: Position) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchPosition: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchPositionResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Position) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedPositions: updatedResults })
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
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchPositionResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: PositionStore.getState().setLoading,
    })
    if (response) {
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchPositionResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: PositionStore.getState().setLoading,
    })
    if (response) {
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchPositionResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: PositionStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false, error: null })
      PositionStore.getState().setProcessedResults(response.data)
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
    const response = await apiRequest<FetchPositionResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: PositionStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false, error: null })
      PositionStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false, error: null })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.positionResults[index]?.isActive
      const updatedResults = state.positionResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        positionResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.positionResults.map((tertiary, idx) =>
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
        positionResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.positionResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.positionResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        positionResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default PositionStore
