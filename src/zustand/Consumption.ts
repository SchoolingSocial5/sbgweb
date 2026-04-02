import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Consumption[]
  data: Consumption
  result: FetchResponse
}

export interface Consumption {
  _id: string
  birds: number
  amount: number
  unitPrice: number
  birdAge: string
  consumption: number
  birdClass: string
  consumptionUnit: string
  feed: string
  weight: string
  remark: string
  feedId: string
  pen: string
  staffName: string
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const ConsumptionEmpty = {
  _id: '',
  birds: 0,
  birdAge: '',
  unitPrice: 0,
  consumption: 0,
  amount: 0,
  birdClass: '',
  consumptionUnit: '',
  feed: '',
  feedId: '',
  weight: '',
  remark: '',
  pen: '',
  staffName: '',
  createdAt: null,
}

interface ConsumptionState {
  count: number
  page_size: number
  consumptions: Consumption[]
  latestConsumptions: Consumption[]
  loading: boolean
  showConsumptionForm: boolean
  isAllChecked: boolean
  consumptionForm: Consumption
  setShowConsumptionForm: (status: boolean) => void
  resetForm: () => void
  setForm: (
    key: keyof Consumption,
    value: Consumption[keyof Consumption]
  ) => void
  getConsumptions: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getLatestConsumptions: (
    url: string,
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedConsumptions: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateConsumption: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postConsumption: (
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

const ConsumptionStore = create<ConsumptionState>((set) => ({
  count: 0,
  page_size: 0,
  consumptions: [],
  latestConsumptions: [],
  loading: false,
  showConsumptionForm: false,
  isAllChecked: false,
  consumptionForm: ConsumptionEmpty,
  resetForm: () =>
    set({
      consumptionForm: ConsumptionEmpty,
    }),
  setForm: (key, value) =>
    set((state) => ({
      consumptionForm: {
        ...state.consumptionForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Consumption) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        consumptions: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowConsumptionForm: (loadState: boolean) => {
    set({ showConsumptionForm: loadState })
  },

  getConsumptions: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ConsumptionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ConsumptionStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getLatestConsumptions: async (url,) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ConsumptionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ latestConsumptions: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      consumptions: state.consumptions.map((item: Consumption) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url,
    selectedConsumptions,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedConsumptions,
      setMessage,
      setLoading: ConsumptionStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      ConsumptionStore.getState().setProcessedResults(data)
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
      ConsumptionStore.getState().setProcessedResults(data)
    }
  },

  updateConsumption: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: ConsumptionStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        ConsumptionStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postConsumption: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: ConsumptionStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        ConsumptionStore.getState().setProcessedResults(data.result)
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
      const isCurrentlyActive = state.consumptions[index]?.isActive
      const updatedResults = state.consumptions.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        consumptions: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.consumptions.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )

      return {
        consumptions: updatedResults,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.consumptions.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.consumptions.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      return {
        consumptions: updatedResults,
        isAllChecked,
      }
    })
  },
}))

export default ConsumptionStore
