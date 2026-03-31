import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Visitor[]
  data: Visitor
  result: FetchResponse
}

export interface Visitor {
  _id: string
  name: string
  purpose: string
  phone: string
  recordedBy: string
  remark: string
  visited: string
  staffUsername: string
  leftAt: Date | null | number
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const VisitorEmpty = {
  _id: '',
  name: '',
  purpose: '',
  staffUsername: '',
  phone: '',
  visited: '',
  recordedBy: '',
  remark: '',
  leftAt: null,
  createdAt: null,
}

interface VisitorState {
  count: number
  page_size: number
  visitors: Visitor[]
  selectedVisitors: Visitor[]
  loading: boolean
  showVisitorForm: boolean
  isAllChecked: boolean
  visitorForm: Visitor
  setShowVisitorForm: (status: boolean) => void
  resetForm: () => void
  setForm: (key: keyof Visitor, value: Visitor[keyof Visitor]) => void
  getVisitors: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedVisitors: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateVisitor: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postVisitor: (
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

const VisitorStore = create<VisitorState>((set) => ({
  count: 0,
  page_size: 0,
  visitors: [],
  selectedVisitors: [],
  loading: false,
  showVisitorForm: false,
  isAllChecked: false,
  visitorForm: VisitorEmpty,
  resetForm: () =>
    set({
      visitorForm: VisitorEmpty,
    }),
  setForm: (key, value) =>
    set((state) => ({
      visitorForm: {
        ...state.visitorForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Visitor) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        visitors: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowVisitorForm: (loadState: boolean) => {
    set({ showVisitorForm: loadState })
  },

  getVisitors: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: VisitorStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        VisitorStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      visitors: state.visitors.map((item: Visitor) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url,
    selectedVisitors,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedVisitors,
      setMessage,
      setLoading: VisitorStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      VisitorStore.getState().setProcessedResults(data)
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
      VisitorStore.getState().setProcessedResults(data)
    }
  },

  updateVisitor: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: VisitorStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        VisitorStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postVisitor: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: VisitorStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        VisitorStore.getState().setProcessedResults(data.result)
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
      const isCurrentlyActive = state.visitors[index]?.isActive
      const updatedResults = state.visitors.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        visitors: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.visitors.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )

      return {
        visitors: updatedResults,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.visitors.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.visitors.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      return {
        visitors: updatedResults,
        isAllChecked,
      }
    })
  },
}))

export default VisitorStore
