import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

export interface Department {
  _id: string
  facultyId: string
  schoolId: string
  faculty: string
  facultyUsername: string
  name: string
  username: string
  picture: string | File | null
  media: string | File | null
  description: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}
export interface Position {
  _id: string
  levelName: string
  officeUsername: string
  bioUserUsername: string
  level: number
  staffPicture: string
  name: string
  arm: string
}

export const DepartmentEmpty = {
  _id: '',
  facultyId: '',
  schoolId: '',
  faculty: '',
  facultyUsername: '',
  name: '',
  username: '',
  picture: '',
  media: '',
  description: '',
  createdAt: null,
}
export const PositionEmpty = {
  _id: '',
  levelName: '',
  officeUsername: '',
  bioUserUsername: '',
  level: 0,
  staffPicture: '',
  name: '',
  arm: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Department[]
}
interface FetchPositionResponse {
  message: string
  count: number
  page_size: number
  results: Position[]
}

interface DepartmentState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  positions: Position[]
  departments: Department[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Department[]
  searchedDepartments: Department[]
  isAllChecked: boolean
  departmentalForm: Department
  setForm: (key: keyof Department, value: Department[keyof Department]) => void
  resetForm: () => void
  getDepartments: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getStaffPositions: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getDepartment: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  processPosition: (data: FetchPositionResponse) => void
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    refreshUrl: string,
    selectedItems: Department[],
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
  searchDepartment: (url: string) => void
}

const DepartmentStore = create<DepartmentState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 0,
  departments: [],
  loading: false,
  error: null,
  selectedItems: [],
  positions: [],
  searchedDepartments: [],
  isAllChecked: false,
  departmentalForm: DepartmentEmpty,
  setForm: (key, value) =>
    set((state) => ({
      departmentalForm: {
        ...state.departmentalForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      departmentalForm: DepartmentEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  processPosition: ({ count, page_size, results }: FetchPositionResponse) => {
    if (results) {
      const updatedResults = results.map((item: Position) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        positions: updatedResults,
      })
    }
  },
  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Department) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        departments: updatedResults,
      })
    }
  },

  getDepartments: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: DepartmentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        DepartmentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getStaffPositions: async (url: string) => {
    try {
      const response = await apiRequest<FetchPositionResponse>(url, {
        setLoading: DepartmentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        DepartmentStore.getState().processPosition(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getDepartment: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: DepartmentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          departmentalForm: {
            ...DepartmentStore.getState().departmentalForm,
            ...data,
          },
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      departments: state.departments.map((item: Department) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchDepartment: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url)
    const results = response?.data.results
    if (results) {
      const updatedResults = results.map((item: Department) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedDepartments: updatedResults })
    }
  }, 1000),

  massDelete: async (
    url: string,
    refreshUrl: string,
    selectedItems: Department[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      body: selectedItems,
    })
    if (response) {
      const getDepartments = get().getDepartments
      getDepartments(refreshUrl, setMessage)
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
      DepartmentStore.getState().setProcessedResults(data)
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
      setLoading: DepartmentStore.getState().setLoading,
    })
    if (response?.data) {
      DepartmentStore.getState().setProcessedResults(response.data)
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
      setLoading: DepartmentStore.getState().setLoading,
    })
    if (response?.data) {
      DepartmentStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.departments[index]?.isActive
      const updatedResults = state.departments.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        departments: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.departments.map((tertiary, idx) =>
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
        departments: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.departments.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.departments.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        departments: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default DepartmentStore
