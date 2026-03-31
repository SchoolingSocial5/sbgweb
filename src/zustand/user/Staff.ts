import { create } from 'zustand'
import apiRequest from '@/lib/axios'

export interface Staff {
  _id: string
  username: string
  fullName: string
  picture: string
  staffPositions: string
  staffRanking: number
  email: string
  phone: string
  isChecked?: boolean
  isActive?: boolean
}

export const StaffEmpty = {
  _id: '',
  username: '',
  fullName: '',
  picture: '',
  staffPositions: '',
  staffRanking: 1,
  email: '',
  phone: '',
}

interface FetchResponse {
  count: number
  message: string
  page_size: number
  results: Staff[]
}

interface StaffState {
  count: number
  page_size: number
  staffs: Staff[]
  loading: boolean
  selectedStaffs: Staff[]
  isAllChecked: boolean
  staffForm: Staff
  setForm: (key: keyof Staff, value: Staff[keyof Staff]) => void
  resetForm: () => void
  getStaffs: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  massDelete: (
    url: string,
    selectedStaffs: Staff[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteStaff: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>
  updateStaff: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleStaff: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
}

const StaffStore = create<StaffState>((set) => ({
  count: 0,
  page_size: 20,
  staffs: [],
  loading: false,
  selectedStaffs: [],
  searchResult: [],
  isAllChecked: false,
  staffForm: StaffEmpty,
  setForm: (key, value) =>
    set((state) => ({
      staffForm: {
        ...state.staffForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      staffForm: StaffEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    const updatedResults = results.map((item: Staff) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set({
      loading: false,
      count,
      page_size,
      staffs: updatedResults,
    })
  },

  getStaffs: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        StaffStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      staffs: state.staffs.map((item: Staff) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url: string,
    selectedStaffs: Staff[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedStaffs,
      setMessage,
    })
    if (response) {
    }
  },

  deleteStaff: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      setMessage,
    })
    if (response) {
    }
  },

  updateStaff: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    if (response?.data) {
      StaffStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.staffs[index]?.isActive
      const updatedResults = state.staffs.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        staffs: updatedResults,
      }
    })
  },

  toggleStaff: (index: number) => {
    set((state) => {
      const updatedResults = state.staffs.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedStaffs = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        staffs: updatedResults,
        selectedStaffs: updatedSelectedStaffs,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.staffs.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.staffs.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedStaffs = isAllChecked ? updatedResults : []

      return {
        staffs: updatedResults,
        selectedStaffs: updatedSelectedStaffs,
        isAllChecked,
      }
    })
  },
}))

export default StaffStore
