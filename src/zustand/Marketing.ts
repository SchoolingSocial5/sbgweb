import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Marketing[]
  data: Marketing
  result: FetchResponse
}

export interface Marketing {
  _id: string
  customerName: string
  customerAddress: string
  customerPhone: string
  remark: string
  staffName: string
  isRegistered: boolean
  username: string
  email: string
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const MarketingEmpty = {
  _id: '',
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  remark: '',
  staffName: '',
  email: '',
  isRegistered: false,
  username: '',
  createdAt: null,
}

interface MarketingState {
  count: number
  page_size: number
  marketings: Marketing[]
  loading: boolean
  showMarketingForm: boolean
  isAllChecked: boolean
  marketingForm: Marketing
  setShowMarketingForm: (status: boolean) => void
  resetForm: () => void
  setForm: (key: keyof Marketing, value: Marketing[keyof Marketing]) => void
  getMarketings: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedMarketings: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateMarketing: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postMarketing: (
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

const MarketingStore = create<MarketingState>((set) => ({
  count: 0,
  page_size: 0,
  marketings: [],
  loading: false,
  showMarketingForm: false,
  isAllChecked: false,
  marketingForm: MarketingEmpty,
  resetForm: () =>
    set({
      marketingForm: MarketingEmpty,
    }),
  setForm: (key, value) =>
    set((state) => ({
      marketingForm: {
        ...state.marketingForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Marketing) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        marketings: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowMarketingForm: (loadState: boolean) => {
    set({ showMarketingForm: loadState })
  },

  getMarketings: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: MarketingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        MarketingStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      marketings: state.marketings.map((item: Marketing) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url,
    selectedMarketings,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedMarketings,
      setMessage,
      setLoading: MarketingStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      MarketingStore.getState().setProcessedResults(data)
    }
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
      MarketingStore.getState().setProcessedResults(data)
    }
  },

  updateMarketing: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: MarketingStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        MarketingStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postMarketing: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: MarketingStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        MarketingStore.getState().setProcessedResults(data.result)
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
      const isCurrentlyActive = state.marketings[index]?.isActive
      const updatedResults = state.marketings.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        marketings: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.marketings.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )

      return {
        marketings: updatedResults,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.marketings.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.marketings.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      return {
        marketings: updatedResults,
        isAllChecked,
      }
    })
  },
}))

export default MarketingStore
