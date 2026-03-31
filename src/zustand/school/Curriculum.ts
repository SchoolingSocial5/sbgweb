import { create } from 'zustand'
import apiRequest from '@/lib/axios'

export interface Activity {
  _id: string
  title: string
  content: string
  officeUsername: string
  isHoliday: boolean
  picture: string | File
  startingDate: Date | null
  endingDate: Date | null
  isActive?: boolean
  isChecked?: boolean
}

export interface Curriculum {
  _id: string
  country: string
  level: number
  levelName: string
  content: string
  title: string
  isActive?: boolean
  isChecked?: boolean
}

export const ActivityEmpty = {
  _id: '',
  content: '',
  title: '',
  picture: '',
  officeUsername: '',
  isHoliday: false,
  endingDate: null,
  startingDate: null,
}
export const CurriculumEmpty = {
  _id: '',
  country: '',
  level: 0,
  levelName: '',
  content: '',
  title: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Curriculum[]
  data: Curriculum
}

interface FetchActivityResponse {
  message: string
  count: number
  page_size: number
  results: Activity[]
  data: Activity
}

interface CurriculumState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  activities: Activity[]
  curriculums: Curriculum[]
  loading: boolean
  isBoxVisible: boolean
  selectedItems: Curriculum[]
  searcheditems: Curriculum[]
  isAllChecked: boolean
  activityForm: Activity
  curriculumForm: Curriculum
  setForm: (key: keyof Curriculum, value: Curriculum[keyof Curriculum]) => void
  setActivity: (key: keyof Activity, value: Activity[keyof Activity]) => void
  resetForm: () => void
  getCurriculums: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getActivities: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getCurriculum: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    runFuction?: () => void
  ) => Promise<void>
  getActivity: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    runFuction?: () => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  processActivity: (data: FetchActivityResponse) => void
  setBoxVisibility: (loading: boolean) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Curriculum[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteActivity: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateCurriculum: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    runFuction?: () => void
  ) => Promise<void>
  updateActivity: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    runFuction?: () => void
  ) => Promise<void>
  postActivity: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    runFuction?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
}

const CurriculumStore = create<CurriculumState>((set) => ({
  links: null,
  count: 0,
  page_size: 20,
  activities: [],
  curriculums: [],
  loading: false,
  isBoxVisible: false,
  error: null,
  selectedItems: [],
  searcheditems: [],
  isAllChecked: false,
  activityForm: ActivityEmpty,
  curriculumForm: CurriculumEmpty,

  setActivity: (key, value) =>
    set((state) => ({
      activityForm: {
        ...state.activityForm,
        [key]: value,
      },
    })),

  setForm: (key, value) =>
    set((state) => ({
      curriculumForm: {
        ...state.curriculumForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      curriculumForm: CurriculumEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setBoxVisibility: (status: boolean) => {
    set({ isBoxVisible: status })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Curriculum) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        curriculums: updatedResults,
      })
    }
  },

  processActivity: ({ count, page_size, results }: FetchActivityResponse) => {
    if (results) {
      const updatedResults = results.map((item: Activity) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        activities: updatedResults,
      })
    }
  },

  getCurriculum: async (url, setMessage, runFuction) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: CurriculumStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ curriculumForm: data.data })
      }
      if (runFuction) runFuction()
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getActivity: async (url, setMessage, runFuction) => {
    try {
      const response = await apiRequest<FetchActivityResponse>(url, {
        setLoading: CurriculumStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ activityForm: data.data })
      }
      if (runFuction) runFuction()
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getCurriculums: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: CurriculumStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        CurriculumStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getActivities: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchActivityResponse>(url, {
        setLoading: CurriculumStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        CurriculumStore.getState().processActivity(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      curriculums: state.curriculums.map((item: Curriculum) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url: string,
    selectedItems: Curriculum[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      setMessage,
      body: selectedItems,
    })
    if (response) {
    }
  },

  deleteActivity: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => {
    const response = await apiRequest<FetchActivityResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data

    if (data) {
      CurriculumStore.getState().processActivity(data)
    }
  },

  updateCurriculum: async (url, updatedItem, setMessage, runFuction) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: CurriculumStore.getState().setLoading,
    })
    if (response?.data) {
      CurriculumStore.getState().setProcessedResults(response.data)
    }
    if (runFuction) runFuction()
  },

  updateActivity: async (url, updatedItem, setMessage, runFuction) => {
    set({ loading: true })
    const response = await apiRequest<FetchActivityResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: CurriculumStore.getState().setLoading,
    })
    if (response?.data) {
      CurriculumStore.getState().processActivity(response.data)
    }
    if (runFuction) runFuction()
  },

  postActivity: async (url, updatedItem, setMessage, runFuction) => {
    set({ loading: true })
    const response = await apiRequest<FetchActivityResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: CurriculumStore.getState().setLoading,
    })
    if (response?.data) {
      CurriculumStore.getState().processActivity(response.data)
    }
    if (runFuction) runFuction()
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.curriculums[index]?.isActive
      const updatedResults = state.curriculums.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        curriculums: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.curriculums.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedCurriculums = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        curriculums: updatedResults,
        selectedItems: updatedCurriculums,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.curriculums.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.curriculums.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedCurriculums = isAllChecked ? updatedResults : []

      return {
        curriculums: updatedResults,
        selectedItems: updatedCurriculums,
        isAllChecked,
      }
    })
  },
}))

export default CurriculumStore
