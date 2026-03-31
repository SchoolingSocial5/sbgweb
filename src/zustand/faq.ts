import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Faq[]
  data: Faq
  result: FetchResponse
}

export interface Faq {
  _id: string
  question: string
  category: string
  answer: string
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const FaqEmpty = {
  _id: '',
  question: '',
  answer: '',
  category: '',
  createdAt: 0,
}

interface FaqState {
  count: number
  page_size: number
  faqs: Faq[]
  loading: boolean
  selectedFaqs: Faq[]
  searchedFaqs: Faq[]
  isAllChecked: boolean
  isForm: boolean
  faqForm: Faq
  showForm: (status: boolean) => void
  setForm: (key: keyof Faq, value: Faq[keyof Faq]) => void
  resetForm: () => void
  getFaq: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getFaqs: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedFaqs: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteFaq: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateFaq: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postFaq: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchFaq: (url: string) => void
}

const FaqStore = create<FaqState>((set) => ({
  count: 0,
  page_size: 0,
  faqs: [],
  loading: false,
  isForm: false,
  selectedFaqs: [],
  searchedFaqs: [],
  isAllChecked: false,
  faqForm: FaqEmpty,
  setForm: (key, value) =>
    set((state) => ({
      faqForm: {
        ...state.faqForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      faqForm: FaqEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Faq) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        faqs: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },
  showForm: (loadState: boolean) => {
    set({ isForm: loadState })
  },

  getFaqs: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: FaqStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        FaqStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getFaq: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: FaqStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ faqForm: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      faqs: state.faqs.map((item: Faq) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchFaq: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: FaqStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedFaqs: results })
    }
  }, 1000),

  massDelete: async (url, selectedFaqs, setMessage) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedFaqs,
      setMessage,
      setLoading: FaqStore.getState().setLoading,
    })
    const data = response?.data
    console.log(data)
    if (data) {
      FaqStore.getState().setProcessedResults(data)
    }
  },

  deleteFaq: async (url, setMessage, setLoading) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data
    if (data) {
      FaqStore.getState().setProcessedResults(data)
    }
  },

  updateFaq: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: FaqStore.getState().setLoading,
    })
    const data = response.data
    if (data) {
      FaqStore.getState().setProcessedResults(data.result)
    }
    if (redirect) redirect()
  },

  postFaq: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: FaqStore.getState().setLoading,
    })
    const data = response.data
    if (data) {
      FaqStore.getState().setProcessedResults(data.result)
    }

    if (redirect) redirect()
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.faqs[index]?.isActive
      const updatedResults = state.faqs.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        faqs: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.faqs.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedFaqs = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        faqs: updatedResults,
        selectedFaqs: updatedSelectedFaqs,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked = state.faqs.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.faqs.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedFaqs = isAllChecked ? updatedResults : []

      return {
        faqs: updatedResults,
        selectedFaqs: updatedSelectedFaqs,
        isAllChecked,
      }
    })
  },
}))

export default FaqStore
