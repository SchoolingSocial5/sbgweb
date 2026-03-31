import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  count: number
  message: string
  page_size: number
  results: Policy[]
  data: Policy
}

export const PolicyEmpty = {
  _id: '',
  name: '',
  title: '',
  content: '',
  category: '',
  createdAt: new Date(),
}

interface PolicyState {
  policyForm: Policy
  policies: Policy[]
  terms: Policy[]
  count: number
  isAllChecked: boolean
  loading: boolean
  page: number
  page_size: number
  selectedPolicies: Policy[]
  selectedTerms: Policy
  deletePolicy: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getPolicy: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getPolicies: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getTerms: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  massDeletePolices: (
    url: string,
    selectedPolicies: Policy[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  resetForm: () => void
  reshuffleResults: () => void
  selectPolicy: (num: number) => void
  selectTerm: (num: number) => void
  setForm: (key: keyof Policy, value: Policy[keyof Policy]) => void
  setProcessedResults: (data: FetchResponse) => void
  processTerms: (data: FetchResponse) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  updatePolicy: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
}

export const PolicyStore = create<PolicyState>((set) => ({
  policyForm: PolicyEmpty,
  policies: [],
  terms: [],
  count: 0,
  isAllChecked: false,
  loading: false,
  page: 1,
  page_size: 20,
  selectedPolicies: [],
  selectedTerms: PolicyEmpty,

  deletePolicy: async (
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

  getPolicy: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        set({
          policyForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  getPolicies: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data
      if (data) {
        PolicyStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getTerms: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data
      if (data) {
        PolicyStore.getState().processTerms(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  massDeletePolices: async (
    url: string,
    selectedPolicies: Policy[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      set({ loading: true })
      await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: selectedPolicies,
        setMessage,
      })
    } catch (error) {
      console.log(error)
    }
  },

  resetForm: () =>
    set({
      policyForm: PolicyEmpty,
    }),

  reshuffleResults: async () => {
    set((state) => ({
      policies: state.policies.map((item: Policy) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  selectPolicy: (num: number) => {
    set((state) => {
      const updatedResults = state.policies.map(
        (item: Policy, index: number) => ({
          ...item,
          isChecked: num === index ? true : false,
          isActive: false,
        })
      )
      return {
        policyForm: state.policies[num],
        policies: updatedResults,
      }
    })
  },

  selectTerm: (num: number) => {
    set((state) => {
      const updatedResults = state.terms.map((item: Policy, index: number) => ({
        ...item,
        isChecked: num === index ? true : false,
        isActive: false,
      }))
      return {
        selectedTerms: state.terms[num],
        terms: updatedResults,
      }
    })
  },

  setForm: (key, value) =>
    set((state) => ({
      policyForm: {
        ...state.policyForm,
        [key]: value,
      },
    })),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    const updatedResults = results.map((item: Policy) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set({
      loading: false,
      count,
      page_size,
      policies: updatedResults,
      policyForm: updatedResults[0],
    })
  },

  processTerms: ({ count, page_size, results }: FetchResponse) => {
    const updatedResults = results.map((item: Policy) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set({
      loading: false,
      count,
      page_size,
      terms: updatedResults,
      selectedTerms: updatedResults[0],
    })
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.policies[index]?.isActive
      const updatedResults = state.policies.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        policies: updatedResults,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.policies.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.policies.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        policies: updatedResults,
        selectedPolicies: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.policies.map((tertiary, idx) =>
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
        policies: updatedResults,
        selectedPolicies: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  updatePolicy: async (
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
    const data = response?.data
    if (data) {
      set({ policyForm: data.data })
    }
  },
}))

export interface Policy {
  _id: string
  name: string
  title: string
  content: string
  category: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}
