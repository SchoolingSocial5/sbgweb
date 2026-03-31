import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

export interface Document {
  _id: string
  picture: string | File | null
  name: string
  tempDoc: string
  required: boolean
  description: string
  country: string
  countryFlag: string
  placeId: string
  isChecked?: boolean
  isActive?: boolean
}

export const DocumentEmpty = {
  _id: '',
  picture: '',
  name: '',
  tempDoc: '',
  required: 0,
  description: '',
  country: '',
  countryFlag: '',
  placeId: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Document[]
  data: Document
}

interface DocumentState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  documents: Document[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Document[]
  searchedPositions: Document[]
  isAllChecked: boolean
  formData: Document
  setForm: (key: keyof Document, value: Document[keyof Document]) => void
  resetForm: () => void
  getDocuments: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getDocument: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    refreshUrl: string,
    selectedItems: Document[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
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

const DocumentStore = create<DocumentState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 0,
  documents: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchedPositions: [],
  isAllChecked: false,
  formData: {
    _id: '',
    country: '',
    countryFlag: '',
    description: '',
    placeId: '',
    name: '',
    tempDoc: '',
    required: false,
    picture: null,
  },
  setForm: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      formData: {
        _id: '',
        country: '',
        countryFlag: '',
        description: '',
        placeId: '',
        name: '',
        tempDoc: '',
        picture: null,
        required: false,
      },
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Document) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        documents: updatedResults,
      })
    }
  },

  getDocuments: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: DocumentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        DocumentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getDocument: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: DocumentStore.getState().setLoading,
      })
      const data = response?.data
      console.log(data)
      if (data) {
        set({
          formData: { ...DocumentStore.getState().formData, ...data.data },
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      documents: state.documents.map((item: Document) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchPosition: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url)

    const results = response?.data.results
    if (results) {
      const updatedResults = results.map((item: Document) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedPositions: updatedResults })
    }
  }, 1000),

  massDelete: async (
    url: string,
    refreshUrl: string,
    selectedItems: Document[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      body: selectedItems,
    })
    if (response) {
      const getDocuments = get().getDocuments
      getDocuments(refreshUrl, setMessage)
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
      DocumentStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: DocumentStore.getState().setLoading,
    })
    if (response?.data) {
      DocumentStore.getState().setProcessedResults(response.data)
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: DocumentStore.getState().setLoading,
    })
    if (response?.data) {
      DocumentStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.documents[index]?.isActive
      const updatedResults = state.documents.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        documents: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.documents.map((tertiary, idx) =>
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
        documents: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.documents.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.documents.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        documents: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default DocumentStore
