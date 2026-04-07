import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
    message: string
    count: number
    page_size: number
    results: Pen[]
    data: Pen
    result: FetchResponse
}

export interface Pen {
    _id: string
    name: string
    livestockId?: string
    livestockName?: string
    createdAt: Date | null | number
    isChecked?: boolean
    isActive?: boolean
}

export const PenEmpty = {
    _id: "",
    name: "",
    livestockId: "",
    livestockName: "",
    createdAt: null,
}

interface PenState {
    count: number
    page_size: number
    pens: Pen[]
    loading: boolean
    penForm: Pen
    resetForm: () => void
    setForm: (key: keyof Pen, value: Pen[keyof Pen]) => void
    getPens: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    setProcessedResults: (data: FetchResponse) => void
    setLoading?: (loading: boolean) => void
    createPen: (
        url: string,
        data: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    updatePen: (
        url: string,
        data: FormData | Record<string, unknown>,
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

    setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
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
            const response = await apiRequest<FetchResponse>(url, {
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
            const response = await apiRequest<FetchResponse>(url, {
                method: 'POST',
                body: data,
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
            const response = await apiRequest<FetchResponse>(url, {
                method: 'PATCH',
                body: data,
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
            const response = await apiRequest<FetchResponse>(url, {
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
