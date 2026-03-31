import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Rating[]
  data: Rating
}

export interface Rating {
  _id: string
  username: string
  fullName: string
  picture: string
  rating: number
  review: string
  status: boolean
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const RatingEmpty = {
  _id: '',
  username: '',
  fullName: '',
  picture: '',
  rating: 5,
  review: '',
  createdAt: 0,
  status: false
}

interface RatingState {
  count: number
  page_size: number
  ratings: Rating[]
  loading: boolean
  selectedRatings: Rating[]
  searchedRatings: Rating[]
  isAllChecked: boolean
  isForm: boolean
  ratingForm: Rating
  showForm: (status: boolean) => void
  setForm: (key: keyof Rating, value: Rating[keyof Rating]) => void
  resetForm: () => void
  getRating: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getRatings: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedRatings: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteRating: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateRating: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postRating: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchRating: (url: string) => void
}

const RatingStore = create<RatingState>((set) => ({
  count: 0,
  page_size: 0,
  ratings: [],
  loading: false,
  isForm: false,
  selectedRatings: [],
  searchedRatings: [],
  isAllChecked: false,
  ratingForm: RatingEmpty,
  setForm: (key, value) =>
    set((state) => ({
      ratingForm: {
        ...state.ratingForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      ratingForm: RatingEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Rating) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        ratings: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },
  showForm: (loadState: boolean) => {
    set({ isForm: loadState })
  },

  getRatings: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: RatingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        RatingStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getRating: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: RatingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ ratingForm: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      ratings: state.ratings.map((item: Rating) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchRating: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: RatingStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedRatings: results })
    }
  }, 1000),

  massDelete: async (url, selectedRatings, setMessage) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedRatings,
      setMessage,
      setLoading: RatingStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      RatingStore.getState().setProcessedResults(data)
    }
  },

  deleteRating: async (url, setMessage, setLoading) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data
    if (data) {
      RatingStore.getState().setProcessedResults(data)
    }
  },

  updateRating: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: RatingStore.getState().setLoading,
    })
    if (response?.data) {
      RatingStore.getState().setProcessedResults(response.data)
    }
    if (redirect) redirect()
  },

  postRating: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: RatingStore.getState().setLoading,
    })
    if (response?.data) {
      RatingStore.getState().setProcessedResults(response.data)
    }

    if (redirect) redirect()
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.ratings[index]?.isActive
      const updatedResults = state.ratings.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        ratings: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.ratings.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedRatings = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        ratings: updatedResults,
        selectedRatings: updatedSelectedRatings,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.ratings.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.ratings.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedRatings = isAllChecked ? updatedResults : []

      return {
        ratings: updatedResults,
        selectedRatings: updatedSelectedRatings,
        isAllChecked,
      }
    })
  },
}))

export default RatingStore
