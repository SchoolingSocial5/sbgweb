import { create } from 'zustand'
import apiRequest from '@/lib/axios'

export interface Expense {
  _id: string
  amount: number
  description: string
  staffName: string
  username: string
  receipt: string | File
  createdAt: Date | null
  isActive?: boolean
  isChecked?: boolean
}

export const ExpenseEmpty = {
  _id: '',
  amount: 0,
  description: '',
  staffName: '',
  username: '',
  receipt: '',
  createdAt: null,
}

interface FetchResponse {
  count: number
  message: string
  page_size: number
  results: Expense[]
  transaction: Expense
  result: FetchResponse
}

interface ExpenseState {
  loading: boolean
  page_size: number
  count: number
  expenses: Expense[]
  latestExpenses: Expense[]
  expensesForm: Expense
  fromDate: Date | null
  toDate: Date | null
  createExpenses: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  setExpenseForm: (key: keyof Expense, value: Expense[keyof Expense]) => void
  updateExpenses: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  getExpenses: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getLatestExpenses: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setFromDate: (date: Date) => void
  setToDate: (date: Date) => void
  setExpensesForm: (data: Expense) => void
  setLoading?: (loading: boolean) => void
}

const ExpenseStore = create<ExpenseState>((set) => ({
  loading: false,
  count: 0,
  page_size: 0,
  expenses: [],
  latestExpenses: [],
  fromDate: null,
  toDate: null,
  expensesForm: ExpenseEmpty,
  summary: { totalLoss: 0, totalProfit: 0 },
  setExpenseForm: (key, value) =>
    set((state) => ({
      expensesForm: {
        ...state.expensesForm,
        [key]: value,
      },
    })),
  setFromDate: (date: Date) => {
    set({ fromDate: date })
  },

  setExpensesForm: (data) => {
    set({ expensesForm: data })
  },
  setToDate: (date: Date) => {
    set({ toDate: date })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Expense) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        expenses: updatedResults,
      })
    }
  },

  getLatestExpenses: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExpenseStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ latestExpenses: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getExpenses: async (url: string, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ExpenseStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ExpenseStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  updateExpenses: async (url, body, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body,
        setMessage,
      })
      const data = response?.data
      if (data) {
        ExpenseStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error: unknown) {
      console.log(error)
    }
  },

  createExpenses: async (url, body, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body,
        setMessage,
      })
      const data = response?.data
      if (data) {
        ExpenseStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error: unknown) {
      console.log(error)
    }
  },
}))

export default ExpenseStore
