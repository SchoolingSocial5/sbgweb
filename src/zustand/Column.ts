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
}

export interface Pen {
    _id: string
    name: string
    columns: Column[]
    createdAt: Date | null | number
}

export const PenEmpty = {
    _id: "",
    name: "",
    columns: [],
    createdAt: null,
}

interface PenState {
    count: number
    page_size: number
    pens: Pen[]
    loading: boolean
    isForm: boolean
    penForm: Pen
    resetForm: () => void
    setForm: (key: keyof Pen, value: any) => void
    getPens: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    setProcessedResults: (data: any) => void
    setLoading?: (loading: boolean) => void
    createPen: (
        url: string,
        data: any,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    updatePen: (
        url: string,
        data: any,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    deletePen: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
}

const PenStore = create<PenState>((set) => ({
    count: 0,
    page_size: 0,
    pens: [],
    loading: false,
    isForm: false,
    penForm: PenEmpty,
    resetForm: () =>
        set({
            penForm: PenEmpty,
        }),
    setForm: (key, value) =>
        set((state) => ({
            penForm: {
                ...state.penForm,
                [key]: value,
            },
        })),

    setProcessedResults: ({ count, page_size, results }: any) => {
        if (results) {
            set({
                count,
                page_size,
                pens: results,
            })
        }
    },

    setLoading: (loadState: boolean) => {
        set({ loading: loadState })
    },

    getPens: async (url, setMessage) => {
        try {
            const response = await apiRequest<any>(url, {
                setMessage,
                setLoading: PenStore.getState().setLoading,
            })
            const data = response?.data
            if (data) {
                PenStore.getState().setProcessedResults(data)
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    createPen: async (url, data, setMessage, redirect) => {
        try {
            const body = { ...data }
            if (body._id === "") delete body._id

            const response = await apiRequest<any>(url, {
                method: 'POST',
                body: body,
                setMessage,
                setLoading: PenStore.getState().setLoading,
            })
            if (response.data) {
                PenStore.getState().setProcessedResults(response.data.result)
                if (redirect) redirect()
            }
        } catch (error) {
            console.log(error)
        }
    },

    updatePen: async (url, data, setMessage, redirect) => {
        try {
            const body = { ...data }
            if (body._id === "") delete body._id

            const response = await apiRequest<any>(url, {
                method: 'PATCH',
                body: body,
                setMessage,
                setLoading: PenStore.getState().setLoading,
            })
            if (response.data) {
                PenStore.getState().setProcessedResults(response.data.result)
                if (redirect) redirect()
            }
        } catch (error) {
            console.log(error)
        }
    },

    deletePen: async (url, setMessage) => {
        try {
            const response = await apiRequest<any>(url, {
                method: 'DELETE',
                setMessage,
                setLoading: PenStore.getState().setLoading,
            })
            if (response.data) {
                PenStore.getState().setProcessedResults(response.data.result)
            }
        } catch (error) {
            console.log(error)
        }
    }
}))

export default PenStore
