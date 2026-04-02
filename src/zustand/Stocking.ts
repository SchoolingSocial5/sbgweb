import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import { Product } from './Product'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Stocking[]
  data: Stocking
  summary: { totalLoss: number; totalProfit: number }
}
interface StockResponse {
  message: string
  count: number
  page_size: number
  results: Product[]
  data: Stocking
}

export interface Stocking {
  _id: string
  name: string
  units: number
  picture: string
  reason: string
  staffName: string
  productId: string
  video: string | File
  amount: number
  percentageProduction: number
  isProfit: boolean
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
  column: string
  pen: string
  unitPerPurchase?: number
  purchaseUnit?: string
}

export const StockingEmpty = {
  _id: '',
  name: '',
  units: 1,
  picture: '',
  staffName: '',
  reason: '',
  productId: '',
  pen: '',
  video: '',
  amount: 0,
  percentageProduction: 0,
  isProfit: false,
  createdAt: null,
  column: '',
  unitPerPurchase: 1,
  purchaseUnit: 'units',
}

interface ProductState {
  count: number
  profits: number
  loss: number
  page_size: number
  summary: { totalLoss: number; totalProfit: number }
  productStockings: Stocking[]
  stocks: Product[]
  latestStocks: Product[]
  latestProductions: Stocking[]
  latestConsumptions: Stocking[]
  latestMotalities: Stocking[]
  mortalities: Stocking[]
  loading: boolean
  showStocking: boolean
  selectedStockings: Stocking[]
  searchedStockings: Stocking[]
  isAllChecked: boolean
  stockingFrom: Stocking
  setShowStocking: (status: boolean) => void
  setStockingForm: (
    key: keyof Stocking,
    value: Stocking[keyof Stocking]
  ) => void
  resetForm: () => void
  getProductStockings: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getStocks: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getLatestStocks: (
    url: string,
  ) => Promise<void>
  getLatestProductions: (
    url: string,
  ) => Promise<void>
  getLatestMotalities: (
    url: string,
  ) => Promise<void>
  getMortalities: (
    url: string,
  ) => Promise<void>
  getLatestConsumptions: (
    url: string,
  ) => Promise<void>

  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedStockings: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateStocking: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>

  postStocking: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchStockings: (url: string) => void
}

const StockingStore = create<ProductState>((set) => ({
  count: 0,
  profits: 0,
  loss: 0,
  page_size: 0,
  summary: { totalLoss: 0, totalProfit: 0 },
  stocks: [],
  latestStocks: [],
  productStockings: [],
  latestProductions: [],
  latestMotalities: [],
  mortalities: [],
  latestConsumptions: [],
  loading: false,
  showStocking: false,
  selectedStockings: [],
  searchedStockings: [],
  isAllChecked: false,
  stockingFrom: StockingEmpty,

  setStockingForm: (key, value) =>
    set((state) => ({
      stockingFrom: {
        ...state.stockingFrom,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      stockingFrom: StockingEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Stocking) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        productStockings: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowStocking: (loadState: boolean) => {
    set({ showStocking: loadState })
  },

  getProductStockings: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: StockingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        console.log(data)
        set({ summary: data.summary })
        StockingStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getStocks: async (url, setMessage) => {
    try {
      const response = await apiRequest<StockResponse>(url, {
        setMessage,
        setLoading: StockingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ stocks: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getLatestStocks: async (url) => {
    try {
      const response = await apiRequest<StockResponse>(url, {
        setLoading: StockingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ latestStocks: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getLatestProductions: async (url) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: StockingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ latestProductions: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getLatestConsumptions: async (url) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: StockingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ latestConsumptions: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getLatestMotalities: async (url) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: StockingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ latestMotalities: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },
  getMortalities: async (url) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: StockingStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ mortalities: data.results, count: data.results.length })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      productStockings: state.productStockings.map((item: Stocking) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchStockings: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: StockingStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedStockings: results })
    }
  }, 1000),

  massDelete: async (
    url,
    selectedStockings,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedStockings,
      setMessage,
      setLoading: StockingStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      StockingStore.getState().setProcessedResults(data)
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
      StockingStore.getState().setProcessedResults(data)
    }
  },

  updateStocking: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: StockingStore.getState().setLoading,
    })
    if (response?.data) {
      StockingStore.getState().setProcessedResults(response.data)
    }
    if (redirect) redirect()
  },

  postStocking: async (url, updatedItem, setMessage, redirect) => {
    await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: StockingStore.getState().setLoading,
    })

    if (redirect) redirect()
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.productStockings[index]?.isActive
      const updatedResults = state.productStockings.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        productStockings: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.productStockings.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedStockings = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        productStockings: updatedResults,
        selectedStockings: updatedSelectedStockings,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.productStockings.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.productStockings.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedStockings = isAllChecked ? updatedResults : []

      return {
        productStockings: updatedResults,
        selectedStockings: updatedSelectedStockings,
        isAllChecked,
      }
    })
  },
}))

export default StockingStore