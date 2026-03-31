import { create } from 'zustand'
import apiRequest from '@/lib/axios'

export interface Salary {
    _id: string
    amount: number
    staffs: number
    description: string
    staffName: string
    username: string
    receipt: string | File
    createdAt: Date | null
    isActive?: boolean
    isChecked?: boolean
}

export const SalaryEmpty = {
    _id: '',
    amount: 0,
    staffs: 0,
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
    results: Salary[]
    transaction: Salary
    result: FetchResponse
}

interface SalaryState {
    loading: boolean
    page_size: number
    count: number
    salaries: Salary[]
    latestSalaries: Salary[]
    salaryForm: Salary
    fromDate: Date | null
    toDate: Date | null
    createSalary: (
        url: string,
        updatedItem: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    setSalaryForm: (key: keyof Salary, value: Salary[keyof Salary]) => void
    updateSalary: (
        url: string,
        updatedItem: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    getSalary: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    getLatestSalaries: (url: string) => Promise<void>
    setProcessedResults: (data: FetchResponse) => void
    setFromDate: (date: Date) => void
    setToDate: (date: Date) => void
    fillSalaryForm: (data: Salary) => void
    setLoading?: (loading: boolean) => void
}

const SalaryStore = create<SalaryState>((set) => ({
    loading: false,
    count: 0,
    page_size: 0,
    salaries: [],
    latestSalaries: [],
    fromDate: null,
    toDate: null,
    salaryForm: SalaryEmpty,
    summary: { totalLoss: 0, totalProfit: 0 },
    setSalaryForm: (key, value) =>
        set((state) => ({
            salaryForm: {
                ...state.salaryForm,
                [key]: value,
            },
        })),
    setFromDate: (date: Date) => {
        set({ fromDate: date })
    },

    fillSalaryForm: (data) => {
        set({ salaryForm: data })
    },
    setToDate: (date: Date) => {
        set({ toDate: date })
    },

    setLoading: (loadState: boolean) => {
        set({ loading: loadState })
    },

    setProcessedResults: ({ count, results }: FetchResponse) => {
        if (results) {
            const updatedResults = results.map((item: Salary) => ({
                ...item,
                isChecked: false,
                isActive: false,
            }))

            set({
                count,
                salaries: updatedResults,
            })
        }
    },

    getLatestSalaries: async (url: string) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                setLoading: SalaryStore.getState().setLoading,
            })
            const data = response?.data
            if (data) {
                set({ latestSalaries: data.results })
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    getSalary: async (url: string, setMessage) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                setMessage,
                setLoading: SalaryStore.getState().setLoading,
            })
            const data = response?.data
            if (data) {
                SalaryStore.getState().setProcessedResults(data)
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    updateSalary: async (url, body, setMessage, redirect) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                method: 'PATCH',
                body,
                setMessage,
            })
            const data = response?.data
            if (data) {
                SalaryStore.getState().setProcessedResults(data.result)
            }
            if (redirect) redirect()
        } catch (error: unknown) {
            console.log(error)
        }
    },

    createSalary: async (url, body, setMessage, redirect) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                method: 'POST',
                body,
                setMessage,
            })
            const data = response?.data
            if (data) {
                SalaryStore.getState().setProcessedResults(data.result)
            }
            if (redirect) redirect()
        } catch (error: unknown) {
            console.log(error)
        }
    },
}))

export default SalaryStore
