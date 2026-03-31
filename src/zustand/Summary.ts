import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
    message: string
    count: number
    page_size: number
    data: Summary
    result: FetchResponse
}

export interface Summary {
    totalAmount: number
    totalDocuments: number
}

export const SummaryEmpty = {
    totalAmount: 0,
    totalDocuments: 0
}

interface SummaryState {
    count: number
    page_size: number
    expenses: Summary
    sales: Summary
    consumptions: Summary
    salaries: Summary
    purchases: Summary
    loading: boolean
    getExpensesSummary: (
        url: string,
    ) => Promise<void>
    getSalarySummary: (
        url: string,
    ) => Promise<void>
    getSalesSummary: (
        url: string,
    ) => Promise<void>
    getPurchaseSummary: (
        url: string,
    ) => Promise<void>
    getConsumptionSummary: (
        url: string,
    ) => Promise<void>
}

const SummaryStore = create<SummaryState>((set) => ({
    count: 0,
    page_size: 0,
    expenses: SummaryEmpty,
    sales: SummaryEmpty,
    purchases: SummaryEmpty,
    salaries: SummaryEmpty,
    consumptions: SummaryEmpty,
    loading: false,
    selectedActivities: [],
    isAllChecked: false,

    getExpensesSummary: async (
        url: string,
    ) => {
        try {
            const response = await apiRequest<FetchResponse>(url)
            const data = response?.data
            if (data) {
                set({ expenses: data.data })
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    getSalarySummary: async (
        url: string,
    ) => {
        try {
            const response = await apiRequest<FetchResponse>(url)
            const data = response?.data
            if (data) {
                set({ salaries: data.data })
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    getSalesSummary: async (
        url: string,
    ) => {
        try {
            const response = await apiRequest<FetchResponse>(url)
            const data = response?.data
            if (data) {
                set({ sales: data.data })
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    getConsumptionSummary: async (
        url: string,
    ) => {
        try {
            const response = await apiRequest<FetchResponse>(url)
            const data = response?.data
            if (data) {
                set({ consumptions: data.data })
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },
    getPurchaseSummary: async (
        url: string,
    ) => {
        try {
            const response = await apiRequest<FetchResponse>(url)
            const data = response?.data
            if (data) {
                set({ purchases: data.data })
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },
}))

export default SummaryStore
