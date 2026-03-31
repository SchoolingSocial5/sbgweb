import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

export interface Faculty {
  _id: string
  schoolId: string
  school: string
  name: string
  username: string
  schoolUsername: string
  picture: string | File | null
  media: string | File | null
  description: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}

export const FacultyEmpty = {
  _id: '',
  schoolId: '',
  school: '',
  name: '',
  username: '',
  schoolUsername: '',
  picture: '',
  media: '',
  description: '',
  createdAt: null,
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Faculty[]
}

interface FacultyState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  faculties: Faculty[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Faculty[]
  searchedFacultys: Faculty[]
  isAllChecked: boolean
  facultyForm: Faculty
  setForm: (key: keyof Faculty, value: Faculty[keyof Faculty]) => void
  resetForm: () => void
  getFaculties: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getFaculty: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    refreshUrl: string,
    selectedItems: Faculty[],
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
  searchFaculty: (url: string) => void
}

const FacultyStore = create<FacultyState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 0,
  faculties: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchedFacultys: [],
  isAllChecked: false,
  facultyForm: FacultyEmpty,
  setForm: (key, value) =>
    set((state) => ({
      facultyForm: {
        ...state.facultyForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      facultyForm: FacultyEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Faculty) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        faculties: updatedResults,
      })
    }
  },

  getFaculties: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: FacultyStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        FacultyStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getFaculty: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: FacultyStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          facultyForm: { ...FacultyStore.getState().facultyForm, ...data },
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      faculties: state.faculties.map((item: Faculty) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchFaculty: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url)
    const results = response?.data.results
    if (results) {
      const updatedResults = results.map((item: Faculty) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedFacultys: updatedResults })
    }
  }, 1000),

  massDelete: async (
    url: string,
    refreshUrl: string,
    selectedItems: Faculty[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      setMessage,
      body: selectedItems,
    })
    if (response) {
      const getFaculties = get().getFaculties
      getFaculties(refreshUrl, setMessage)
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
      FacultyStore.getState().setProcessedResults(data)
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
      setLoading: FacultyStore.getState().setLoading,
    })
    if (response?.data) {
      FacultyStore.getState().setProcessedResults(response.data)
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
      setLoading: FacultyStore.getState().setLoading,
    })
    if (response?.data) {
      FacultyStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.faculties[index]?.isActive
      const updatedResults = state.faculties.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        faculties: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.faculties.map((tertiary, idx) =>
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
        faculties: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.faculties.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.faculties.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        faculties: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default FacultyStore
