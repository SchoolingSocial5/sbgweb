import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

export const AcademicLevelEmpty = {
  _id: '',
  country: '',
  countryFlag: '',
  description: '',
  placeId: '',
  section: '',
  subsection: '',
  institution: '',
  arms: [],
  level: 0,
  maxLevel: 0,
  maxLevelName: '',
  subsectionDegree: '',
  degree: '',
  levelName: '',
  certificateName: '',
  certificate: '',
  inSchool: false,
  isCurriculum: false,
}

export interface School {
  country: string
  userId: string
  bioId: string
  state: string
  area: string
  name: string
  levels: string
  levelNames: []
  username: string
  ownerUsername: string
  type: string
  logo: string
  media: string
  picture: string
  continent: string
  landmark: string
  countryFlag: string
  longitude: number
  latitude: number
  isVerified: boolean
  isNew: boolean
  isRecorded: boolean
}

export interface AcademicLevel {
  _id: string
  country: string
  countryFlag: string
  description: string
  placeId: string
  section: string
  subsection: string
  institution: string
  arms: string[]
  level: number
  maxLevel: number
  maxLevelName: string
  subsectionDegree: string
  degree: string
  levelName: string
  certificateName: string
  certificate: string | File | null
  isCurriculum: boolean
  inSchool: boolean
  isChecked?: boolean
  isActive?: boolean
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: AcademicLevel[]
  data: AcademicLevel
}

interface ActiveLevel {
  level: number
  levelName: string
  maxLevelName: string
  subsectionDegree: string
  degree: string
}

interface AcademicState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  academicResults: AcademicLevel[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: AcademicLevel[]
  activeLevel: ActiveLevel
  searchedPositions: AcademicLevel[]
  uniqueLevels: AcademicLevel[]
  isAllChecked: boolean
  formData: AcademicLevel
  allAcademics: boolean
  setForm: (
    key: keyof AcademicLevel,
    value: AcademicLevel[keyof AcademicLevel]
  ) => void
  setAll: () => void
  resetForm: () => void
  getAcademics: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getAcademic: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    runFucntion?: () => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: AcademicLevel[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    runFucntion?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    runFucntion?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  setActive: (index: number) => void
  setActiveLevel: (level: ActiveLevel) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchPosition: (url: string) => void
}

const AcademicStore = create<AcademicState>((set) => ({
  links: null,
  count: 0,
  page_size: 20,
  academicResults: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchedPositions: [],
  uniqueLevels: [],
  isAllChecked: false,
  allAcademics: false,
  formData: AcademicLevelEmpty,
  activeLevel: {
    level: 0,
    levelName: '',
    maxLevelName: '',
    subsectionDegree: '',
    degree: '',
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
      formData: AcademicLevelEmpty,
    }),

  setAll: () => {
    set((state) => {
      const isCurrentlyActive = state.allAcademics
      const updatedResults = state.academicResults.map((tertiary) => ({
        ...tertiary,
        isChecked: isCurrentlyActive ? tertiary.isChecked : false,
      }))
      return {
        allAcademics: !state.allAcademics,
        academicResults: updatedResults,
      }
    })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const seenLevels = new Set()
      const updatedResults = results.map((item: AcademicLevel) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const uniqueLevels = updatedResults.filter((item) => {
        if (!seenLevels.has(item.levelName)) {
          seenLevels.add(item.levelName)
          return true
        }
        return false
      })

      set({
        loading: false,
        count,
        page_size,
        academicResults: uniqueLevels,
        uniqueLevels,
      })
    }
  },

  getAcademics: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: AcademicStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        AcademicStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getAcademic: async (url, setMessage, runFucntion) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: AcademicStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          formData: { ...AcademicStore.getState().formData, ...data },
          loading: false,
        })
      }
      if (runFucntion) runFucntion()
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      activeLevel: state.formData,
      academicResults: state.academicResults.map((item: AcademicLevel) => ({
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
      const updatedResults = results.map((item: AcademicLevel) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedPositions: updatedResults })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: AcademicLevel[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: selectedItems,
      setMessage,
    })
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      setMessage,
    })
    if (response) {
    }
  },

  updateItem: async (url, updatedItem, setMessage, runFucntion) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: AcademicStore.getState().setLoading,
    })
    if (response?.data) {
      AcademicStore.getState().setProcessedResults(response.data)
    }
    if (runFucntion) runFucntion()
  },

  postItem: async (url, updatedItem, setMessage, runFucntion) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: AcademicStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      AcademicStore.getState().setProcessedResults(response.data)
    }
    if (runFucntion) runFucntion()
  },

  setActiveLevel: (level: ActiveLevel) => {
    set(() => {
      return {
        activeLevel: level,
      }
    })
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.academicResults[index]?.isActive
      const updatedResults = state.academicResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        activeLevel: {
          level: updatedResults[index].level,
          levelName: updatedResults[index].levelName,
          maxLevelName: updatedResults[index].maxLevelName,
          subsectionDegree: updatedResults[index].subsectionDegree,
          degree: updatedResults[index].degree,
        },
        academicResults: updatedResults,
      }
    })
  },

  setActive: (index: number) => {
    set((state) => {
      const updatedResults = state.academicResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? true : false,
      }))
      return {
        activeLevel: {
          level: updatedResults[index].level,
          levelName: updatedResults[index].levelName,
          maxLevelName: updatedResults[index].maxLevelName,
          subsectionDegree: updatedResults[index].subsectionDegree,
          degree: updatedResults[index].degree,
        },
        academicResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.academicResults.map((tertiary, idx) =>
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
        academicResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
        allAcademics: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.academicResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.academicResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        academicResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default AcademicStore
