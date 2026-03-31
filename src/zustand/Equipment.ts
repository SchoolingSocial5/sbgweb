import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Equipment[]
  data: Equipment
  result: FetchResponse
}

export interface Equipment {
  _id: string
  units: number
  equipment: string
  staffName: string
  staffUsername: string
  remark: string
  authorizedBy: string
  issuedBy: string
  returnedAt: Date | null | number
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const EquipmentEmpty = {
  _id: '',
  units: 0,
  remark: '',
  equipment: '',
  staffUsername: '',
  staffName: '',
  authorizedBy: '',
  issuedBy: '',
  returnedAt: null,
  createdAt: null,
}

interface EquipmentState {
  count: number
  page_size: number
  equipments: Equipment[]
  selectedEquipments: Equipment[]
  loading: boolean
  showEquipmentForm: boolean
  isAllChecked: boolean
  equipmentForm: Equipment
  setShowEquipmentForm: (status: boolean) => void
  resetForm: () => void
  setForm: (key: keyof Equipment, value: Equipment[keyof Equipment]) => void
  getEquipments: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedequipments: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateEquipment: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postEquipment: (
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

const EquipmentStore = create<EquipmentState>((set) => ({
  count: 0,
  page_size: 0,
  equipments: [],
  selectedEquipments: [],
  loading: false,
  showEquipmentForm: false,
  isAllChecked: false,
  equipmentForm: EquipmentEmpty,
  resetForm: () =>
    set({
      equipmentForm: EquipmentEmpty,
    }),
  setForm: (key, value) =>
    set((state) => ({
      equipmentForm: {
        ...state.equipmentForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Equipment) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        equipments: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setShowEquipmentForm: (loadState: boolean) => {
    set({ showEquipmentForm: loadState })
  },

  getEquipments: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: EquipmentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        EquipmentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      equipments: state.equipments.map((item: Equipment) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url,
    selectedequipments,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedequipments,
      setMessage,
      setLoading: EquipmentStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      EquipmentStore.getState().setProcessedResults(data)
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
      EquipmentStore.getState().setProcessedResults(data)
    }
  },

  updateEquipment: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: EquipmentStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        EquipmentStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  postEquipment: async (url, updatedItem, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: EquipmentStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        EquipmentStore.getState().setProcessedResults(data.result)
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
      const isCurrentlyActive = state.equipments[index]?.isActive
      const updatedResults = state.equipments.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        equipments: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.equipments.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )

      return {
        equipments: updatedResults,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.equipments.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.equipments.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      return {
        equipments: updatedResults,
        isAllChecked,
      }
    })
  },
}))

export default EquipmentStore
