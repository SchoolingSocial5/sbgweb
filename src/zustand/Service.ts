import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Service[]
  data: Service
  result: FetchResponse
}

export interface Service {
  _id: string
  title: string
  description: string
  username: string
  clientName: string
  clientPhone: string
  warranty: string
  clientAddress: string
  amount: number
  startedAt: null | Date | number
  endedAt: null | Date | number
  receipt: string
  video: string | File
  staffName: string
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const ServiceEmpty = {
  _id: '',
  title: '',
  description: '',
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  warranty: '',
  amount: 0,
  startedAt: null,
  endedAt: null,
  receipt: '',
  video: '',
  staffName: '',
  username: '',
  createdAt: null,
}

interface ServiceState {
  count: number
  page_size: number
  services: Service[]
  searchedServices: Service[]
  loading: boolean
  showServiceForm: boolean
  isAllChecked: boolean
  serviceForm: Service
  setShowServiceForm: (status: boolean) => void
  resetForm: () => void
  setForm: (key: keyof Service, value: Service[keyof Service]) => void
  getServices: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedServices: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateService: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postService: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchServices: (url: string) => void
}

const ServiceStore = create<ServiceState>((set) => ({
  count: 0,
  page_size: 0,
  services: [],
  searchedServices: [],
  loading: false,
  showServiceForm: false,
  isAllChecked: false,
  serviceForm: ServiceEmpty,
  resetForm: () =>
    set({
      serviceForm: ServiceEmpty,
    }),
  setForm: (key, value) =>
    set((state) => ({
      serviceForm: {
        ...state.serviceForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Service) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        services: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowServiceForm: (loadState: boolean) => {
    set({ showServiceForm: loadState })
  },

  getServices: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ServiceStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ServiceStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      services: state.services.map((item: Service) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchServices: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: ServiceStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedServices: results })
    }
  }, 1000),

  massDelete: async (
    url,
    selectedServices,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedServices,
      setMessage,
      setLoading: ServiceStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      ServiceStore.getState().setProcessedResults(data)
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
      ServiceStore.getState().setProcessedResults(data)
    }
  },

  updateService: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: ServiceStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        ServiceStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postService: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: ServiceStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        ServiceStore.getState().setProcessedResults(data.result)
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
      const isCurrentlyActive = state.services[index]?.isActive
      const updatedResults = state.services.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        services: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.services.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )

      return {
        services: updatedResults,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.services.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.services.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      return {
        services: updatedResults,
        isAllChecked,
      }
    })
  },
}))

export default ServiceStore
