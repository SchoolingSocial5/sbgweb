import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Strategy[]
  data: Strategy
  result: FetchResponse
}

export interface Strategy {
  _id: string
  authority: string
  strategies: string[]
  remark: string
  staffName: string
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const StrategyEmpty = {
  _id: '',
  authority: '',
  strategies: [],
  remark: '',
  staffName: '',
  createdAt: null,
}

interface StrategyState {
  count: number
  page_size: number
  strategies: Strategy[]
  loading: boolean
  showStrategyForm: boolean
  isAllChecked: boolean
  strategyForm: Strategy
  setShowStrategyForm: (status: boolean) => void
  resetForm: () => void
  setForm: (key: keyof Strategy, value: Strategy[keyof Strategy]) => void
  getStrategies: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedStrategies: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateStrategy: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postStrategy: (
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

const StrategyStore = create<StrategyState>((set) => ({
  count: 0,
  page_size: 0,
  strategies: [],
  loading: false,
  showStrategyForm: false,
  isAllChecked: false,
  strategyForm: StrategyEmpty,
  resetForm: () =>
    set({
      strategyForm: StrategyEmpty,
    }),
  setForm: (key, value) =>
    set((state) => ({
      strategyForm: {
        ...state.strategyForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Strategy) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        strategies: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowStrategyForm: (loadState: boolean) => {
    set({ showStrategyForm: loadState })
  },

  getStrategies: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: StrategyStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        StrategyStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      strategies: state.strategies.map((item: Strategy) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url,
    selectedStrategies,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedStrategies,
      setMessage,
      setLoading: StrategyStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      StrategyStore.getState().setProcessedResults(data)
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
      StrategyStore.getState().setProcessedResults(data)
    }
  },

  updateStrategy: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: StrategyStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        StrategyStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postStrategy: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: StrategyStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        StrategyStore.getState().setProcessedResults(data.result)
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
      const isCurrentlyActive = state.strategies[index]?.isActive
      const updatedResults = state.strategies.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        strategies: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.strategies.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )

      return {
        strategies: updatedResults,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.strategies.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.strategies.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      return {
        strategies: updatedResults,
        isAllChecked,
      }
    })
  },
}))

export default StrategyStore
