import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Mortality[]
  data: Mortality
  result: FetchResponse
}

export interface Mortality {
  [key: string]: any
  _id: string
  birds: number
  birds_input?: number | string
  birdAge: string
  birdClass: string
  reason: string
  productId: string
  productName: string
  pen: string
  staffName: string
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const MortalityEmpty = {
  _id: '',
  birds: 0,
  birds_input: '',
  birdAge: '',
  birdClass: '',
  reason: '',
  productId: '',
  productName: '',
  pen: '',
  staffName: '',
  createdAt: null,
}

interface MortalityState {
  count: number
  page_size: number
  mortalities: Mortality[]
  loading: boolean
  showMortalityForm: boolean
  isAllChecked: boolean
  mortalityForm: Mortality
  setShowMortalityForm: (status: boolean) => void
  resetForm: () => void
  setForm: (
    key: keyof Mortality,
    value: Mortality[keyof Mortality]
  ) => void
  getMortalities: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedMortalities: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateMortality: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postMortality: (
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

const MortalityStore = create<MortalityState>((set) => ({
  count: 0,
  page_size: 0,
  mortalities: [],
  loading: false,
  showMortalityForm: false,
  isAllChecked: false,
  mortalityForm: MortalityEmpty,
  resetForm: () =>
    set({
      mortalityForm: MortalityEmpty,
    }),
  setForm: (key, value) =>
    set((state) => ({
      mortalityForm: {
        ...state.mortalityForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Mortality) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        mortalities: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowMortalityForm: (loadState: boolean) => {
    set({ showMortalityForm: loadState })
  },

  getMortalities: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: MortalityStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        MortalityStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      mortalities: state.mortalities.map((item: Mortality) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url,
    selectedMortalities,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedMortalities,
      setMessage,
      setLoading: MortalityStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      MortalityStore.getState().setProcessedResults(data)
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
    if (data && data.results) {
      MortalityStore.getState().setProcessedResults(data)
    } else {
      // Fallback: remove from local state if results aren't returned
      const id = url.split('/').pop()
      if (id) {
        set((state) => ({
          mortalities: state.mortalities.filter((item) => item._id !== id),
          count: state.count - 1
        }))
      }
    }
  },

  updateMortality: async (url, body: any, setMessage, redirect) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: body,
        setMessage,
        setLoading: MortalityStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        MortalityStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postMortality: async (url, body: any, setMessage, redirect) => {
    try {
      set({ loading: true })

      // Handle injecting createdAt
      let finalBody = body;
      if (body instanceof FormData) {
        if (!body.has('createdAt')) body.append('createdAt', new Date().toISOString());
      } else if (Array.isArray(body)) {
        finalBody = body.map(item => ({ ...item, createdAt: item.createdAt || new Date() }));
      } else {
        finalBody = { ...body, createdAt: body.createdAt || new Date() };
      }

      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: finalBody,
        setMessage,
        isMultipart: body instanceof FormData,
        setLoading: MortalityStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        MortalityStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error: any) {
      console.log(error)
      // Save offline if network error
      if (!error.response || error.code === 'ECONNABORTED') {
        const { offlineDb } = await import('@/lib/offlineDb');
        
        // Note: FormData cannot be easily stored in IndexedDB directly if it has blobs/files.
        // For mortality, it's mostly text fields. If it has files, we'd need to convert to Base64.
        // For now, handling as object if possible, or alerting.
        let storageBody = body;
        if (body instanceof FormData) {
            storageBody = Object.fromEntries(body.entries());
        }

        await offlineDb.saveRecord({
          type: 'mortality',
          url,
          body: storageBody,
        });

        if (setMessage) setMessage('Mortality saved offline.', true);
        if (redirect) redirect();
      }
    } finally {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.mortalities[index]?.isActive
      const updatedResults = state.mortalities.map((mort, idx) => ({
        ...mort,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        mortalities: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.mortalities.map((mort, idx) =>
        idx === index
          ? { ...mort, isChecked: !mort.isChecked }
          : mort
      )

      const isAllChecked = updatedResults.every(
        (mort) => mort.isChecked
      )

      return {
        mortalities: updatedResults,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.mortalities.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.mortalities.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      return {
        mortalities: updatedResults,
        isAllChecked,
      }
    })
  },
}))

export default MortalityStore
