import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Activity[]
  data: Activity
  result: FetchResponse
}

export interface Activity {
  _id: string
  staffName: string
  staffUsername: string
  page: string
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

interface ActivityState {
  count: number
  page_size: number
  activities: Activity[]
  loading: boolean
  selectedActivities: Activity[]
  isAllChecked: boolean
  getActivities: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  massDelete: (
    url: string,
    selectedActivities: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (url: number) => void
  toggleAllSelected: () => void
}

const ActivityStore = create<ActivityState>((set) => ({
  count: 0,
  page_size: 0,
  activities: [],
  loading: false,
  selectedActivities: [],
  isAllChecked: false,

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Activity) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        activities: updatedResults,
      })
    }
  },

  getActivities: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        ActivityStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  massDelete: async (url, selectedActivities, setMessage) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedActivities,
      setMessage,
    })
    const data = response?.data
    if (data) {
      ActivityStore.getState().setProcessedResults(data)
    }
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.activities.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedActivities = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        activities: updatedResults,
        selectedActivities: updatedSelectedActivities,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.activities.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.activities.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedActivities = isAllChecked ? updatedResults : []

      return {
        activities: updatedResults,
        selectedActivities: updatedSelectedActivities,
        isAllChecked,
      }
    })
  },
}))

export default ActivityStore
