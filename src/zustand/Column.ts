import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
    message: string
    count: number
    page_size: number
    results: Column[]
    data: Column
    result: FetchResponse
}

export interface Column {
    _id: string
    name: string
    createdAt: Date | null | number
    isChecked?: boolean
    isActive?: boolean
}

export const ColumnEmpty = {
    _id: "",
    name: "",
    createdAt: null,
}

interface ColumnState {
    count: number
    page_size: number
    columns: Column[]
    loading: boolean
    isForm: boolean
    columnForm: Column
    resetForm: () => void
    setForm: (key: keyof Column, value: Column[keyof Column]) => void
    getColumns: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    setProcessedResults: (data: FetchResponse) => void
    setLoading?: (loading: boolean) => void
    createColumn: (
        url: string,
        data: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    updateColumn: (
        url: string,
        data: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    deleteColumn: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
}

const ColumnStore = create<ColumnState>((set) => ({
    count: 0,
    page_size: 0,
    columns: [],
    loading: false,
    isForm: false,
    columnForm: ColumnEmpty,
    resetForm: () =>
        set({
            columnForm: ColumnEmpty,
        }),
    setForm: (key, value) =>
        set((state) => ({
            columnForm: {
                ...state.columnForm,
                [key]: value,
            },
        })),

    setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
        if (results) {
            set({
                count,
                page_size,
                columns: results,
            })
        }
    },

    setLoading: (loadState: boolean) => {
        set({ loading: loadState })
    },

    getColumns: async (url, setMessage) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                setMessage,
                setLoading: ColumnStore.getState().setLoading,
            })
            const data = response?.data
            if (data) {
                ColumnStore.getState().setProcessedResults(data)
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    createColumn: async (url, data, setMessage, redirect) => {
        try {
            const body = { ...data as Record<string, unknown> }
            if (body._id === "") delete body._id

            const response = await apiRequest<FetchResponse>(url, {
                method: 'POST',
                body: body,
                setMessage,
                setLoading: ColumnStore.getState().setLoading,
            })
            if (response.data) {
                ColumnStore.getState().setProcessedResults(response.data.result)
                if (redirect) redirect()
            }
        } catch (error) {
            console.log(error)
        }
    },

    updateColumn: async (url, data, setMessage, redirect) => {
        try {
            const body = { ...data as Record<string, unknown> }
            if (body._id === "") delete body._id

            const response = await apiRequest<FetchResponse>(url, {
                method: 'PATCH',
                body: body,
                setMessage,
                setLoading: ColumnStore.getState().setLoading,
            })
            if (response.data) {
                ColumnStore.getState().setProcessedResults(response.data.result)
                if (redirect) redirect()
            }
        } catch (error) {
            console.log(error)
        }
    },

    deleteColumn: async (url, setMessage) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                method: 'DELETE',
                setMessage,
                setLoading: ColumnStore.getState().setLoading,
            })
            if (response.data) {
                ColumnStore.getState().setProcessedResults(response.data.result)
            }
        } catch (error) {
            console.log(error)
        }
    }
}))

export default ColumnStore
