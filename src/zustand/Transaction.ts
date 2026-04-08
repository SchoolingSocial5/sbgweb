import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import { NotificationResult, Product, ProductEmpty as GlobalProductEmpty } from './Product'
import NotificationStore from './notification/Notification'

export interface Bar {
  totalSales: number
  totalPurchases: number
  date: string | Date
}

export interface Totals {
  totalSales: number
  totalPurchases: number
  profit: number
}

export const TotalsEmpty = {
  totalSales: 0,
  totalPurchases: 0,
  profit: 0,
}

export const BarEmpty = {
  totalSales: 0,
  totalPurchases: 0,
  date: '',
}

export const ProductEmpty = GlobalProductEmpty

export interface Transaction {
  _id: string
  totalAmount: number
  adjustedTotal: number
  payment: string
  staffName: string
  phone: string
  invoiceNumber: string
  distance: number
  fuel: number
  partPayment: number
  total: number
  cartProducts: Product[]
  product: Product
  guide: string
  picture: string
  fullName: string
  username: string
  delivery: string
  supPhone: string
  supAddress: string
  supName: string
  startingLocation: string
  remark: string
  address: string
  status: boolean
  isProfit: boolean
  createdAt: Date | null
  startedAt: null | Date
  endedAt: null | Date
  isActive?: boolean
  isChecked?: boolean
}

export const TransactionEmpty = {
  _id: '',
  totalAmount: 0,
  adjustedTotal: 0,
  payment: '',
  staffName: '',
  phone: '',
  supPhone: '',
  supAddress: '',
  supName: '',
  partPayment: 0,
  picture: '',
  address: '',
  remark: '',
  delivery: 'Instant',
  startingLocation: '',
  invoiceNumber: '',
  guide: '',
  total: 0,
  distance: 0,
  product: ProductEmpty,
  fuel: 0,
  cartProducts: [],
  createdAt: null,
  startedAt: null,
  endedAt: null,
  username: '',
  fullName: '',
  status: false,
  isProfit: false,
}

interface FetchResponse {
  count: number
  message: string
  page_size: number
  results: Transaction[]
  transaction: Transaction
  bars: Bar[]
  result: FetchResponse
  totals: Totals
  notificationResult: NotificationResult
  summary: { totalLoss: number; totalProfit: number }
}

interface TransactionState {
  loading: boolean
  isNotification: boolean
  isAllChecked: boolean
  page_size: number
  bars: Bar[]
  totals: Totals
  summary: { totalLoss: number; totalProfit: number }
  count: number
  period: string
  selectedTransactions: Transaction[]
  transactions: Transaction[]
  trx: Transaction[]
  deliveries: Transaction[]
  userTransactions: Transaction[]
  latest: Transaction[]
  transactionForm: Transaction
  fromDate: Date | null
  toDate: Date | null
  createTransaction: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  updateTransaction: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  updateDelivery: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  updatePartPayment: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  getTransactions: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getDeliveries: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getUserTransactions: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  massDeleteTransactions: (
    url: string,
    selectedTransactions: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getLatestTransactions: (url: string) => Promise<void>
  getTransactionBarchart: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setFromDate: (date: Date) => void
  setToDate: (date: Date) => void
  setPeriod: () => void
  toggleAllSelected: () => void
  setTransactionForm: (data: Transaction) => void
  setPartPayment: (value: number) => void
  setLoading?: (loading: boolean) => void
  toggleChecked: (index: number) => void
}

const TransactionStore = create<TransactionState>((set) => ({
  loading: false,
  isNotification: false,
  isAllChecked: false,
  count: 0,
  page_size: 0,
  bars: [],
  deliveries: [],
  latest: [],
  selectedTransactions: [],
  totals: TotalsEmpty,
  period: 'all',
  transactions: [],
  trx: [],
  userTransactions: [],
  fromDate: null,
  toDate: null,
  transactionForm: TransactionEmpty,
  summary: { totalLoss: 0, totalProfit: 0 },

  setPeriod: () => {
    set({
      period: 'all',
      fromDate: null,
      toDate: null,
    })
  },

  setFromDate: (date: Date) => {
    set({ fromDate: date, period: '' })
  },

  setPartPayment: (value) => {
    set((prev) => {
      return {
        transactionForm: { ...prev.transactionForm, partPayment: value },
      }
    })
  },

  setTransactionForm: (data) => {
    set({ transactionForm: data })
  },
  setToDate: (date: Date) => {
    set({ toDate: date, period: '' })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, results }: FetchResponse) => {
    if (results.length > 0) {
      const updatedResults = results.map((item: Transaction) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        transactions: updatedResults,
        trx: results,
      })
    }
  },

  getTransactionBarchart: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: TransactionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ bars: data.bars, totals: data.totals })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getDeliveries: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: TransactionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ deliveries: data.results, count: data.count })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getLatestTransactions: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: TransactionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ latest: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getUserTransactions: async (url: string, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: TransactionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ userTransactions: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getTransactions: async (url: string, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: TransactionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ summary: data.summary })
        TransactionStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  updatePartPayment: async (url, body, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body,
        setMessage,
      })
      const data = response?.data
      if (data) {
        if (data.transaction) {
          TransactionStore.getState().setProcessedResults(data.result)
        }
        if (data.notificationResult) {
          NotificationStore.setState((prev) => {
            return {
              unread: data.notificationResult.unread,
              notifications: [
                data.notificationResult.notification,
                ...prev.notifications,
              ],
            }
          })
        }
      }
      if (redirect) {
        redirect()
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  updateDelivery: async (url, body, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body,
        setMessage,
      })
      const data = response?.data
      if (data) {
        set({ deliveries: data.result.results, count: data.count })
      }
      if (redirect) redirect()
    } catch (error: unknown) {
      console.log(error)
    }
  },

  updateTransaction: async (url, body, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body,
        setMessage,
      })
      const data = response?.data
      if (data) {
        TransactionStore.getState().setProcessedResults(data.result)
      }
      if (redirect) redirect()
    } catch (error: unknown) {
      console.log(error)
    }
  },

  massDeleteTransactions: async (url, body, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body,
        setMessage,
      })
      const data = response?.data
      if (data) {
        TransactionStore.getState().setProcessedResults(data.result)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  createTransaction: async (url, body, setMessage, redirect) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body,
        setMessage,
      })
      const data = response?.data
      if (data) {
        console.log(data)
      }
      if (redirect) redirect()
    } catch (error: unknown) {
      console.log(error)
    }
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.transactions.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )
      
      const updatedTrx = state.trx.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const selectedTransactions = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )
      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )

      return {
        transactions: updatedResults,
        trx: updatedTrx,
        selectedTransactions,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.transactions.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.transactions.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))
      
      const updatedTrx = state.trx.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedProducts = isAllChecked ? updatedResults : []

      return {
        transactions: updatedResults,
        trx: updatedTrx,
        selectedTransactions: updatedSelectedProducts,
        isAllChecked,
      }
    })
  },
}))

export default TransactionStore