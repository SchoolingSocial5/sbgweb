import { create } from 'zustand'
import apiRequest from '@/lib/axios'

export interface Column {
    _id: string
    name: string
}

interface FetchResponse {
    message: string
    count: number
    page_size: number
    results: any[]
    data: any
    result: FetchResponse
}

export interface Pen {
    _id: string
    name: string
    livestockId?: string
    livestockName?: string
    columns: Column[]
    createdAt: Date | null | number
    isChecked?: boolean
    isActive?: boolean
}

export const PenEmpty: Pen = {
    _id: "",
    name: "",
    livestockId: "",
    livestockName: "",
    columns: [],
    createdAt: null,
}

export const ColumnEmpty: Column = {
    _id: "",
    name: "",
}

interface PenState {
    count: number
    page_size: number
    pens: Pen[]
    columns: Column[]
    loading: boolean
    isForm: boolean
    penForm: Pen
    columnForm: Column
    resetForm: () => void
    setForm: (key: keyof Pen, value: any) => void
    setColumnForm: (key: keyof Column, value: any) => void
    getPens: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    getColumns: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    setProcessedResults: (data: any) => void
    setLoading?: (loadState: boolean) => void
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
    createColumn: (
        url: string,
        data: any,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    updateColumn: (
        url: string,
        data: any,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    deleteColumn: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
}

const PenStore = create<PenState>((set) => ({
    count: 0,
    page_size: 0,
    pens: [],
    columns: [],
    loading: false,
    isForm: false,
    penForm: PenEmpty,
    columnForm: ColumnEmpty,
    resetForm: () =>
        set({
            penForm: PenEmpty,
            columnForm: ColumnEmpty,
        }),
    setForm: (key, value) =>
        set((state) => ({
            penForm: {
                ...state.penForm,
                [key]: value,
            },
        })),
    setColumnForm: (key, value) =>
        set((state) => ({
            columnForm: {
                ...state.columnForm,
                [key]: value,
            },
        })),

    setProcessedResults: (data: any) => {
        const { count, page_size, results } = data
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
                set({ pens: data.results, count: data.count, page_size: data.page_size })
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    getColumns: async (url, setMessage) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                setMessage,
                setLoading: PenStore.getState().setLoading,
            })
            const data = response?.data
            if (data) {
                set({ columns: data.results })
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
                PenStore.getState().getPens('/pens', setMessage)
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
                PenStore.getState().getPens('/pens', setMessage)
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
                PenStore.getState().getPens('/pens', setMessage)
            }
        } catch (error) {
            console.log(error)
        }
    },

    createColumn: async (url, data, setMessage, redirect) => {
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
                PenStore.getState().getColumns('/columns', setMessage)
                if (redirect) redirect()
            }
        } catch (error) {
            console.log(error)
        }
    },

    updateColumn: async (url, data, setMessage, redirect) => {
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
                PenStore.getState().getColumns('/columns', setMessage)
                if (redirect) redirect()
            }
        } catch (error) {
            console.log(error)
        }
    },

    deleteColumn: async (url, setMessage) => {
        try {
            const response = await apiRequest<any>(url, {
                method: 'DELETE',
                setMessage,
                setLoading: PenStore.getState().setLoading,
            })
            if (response.data) {
                PenStore.getState().getColumns('/columns', setMessage)
            }
        } catch (error) {
            console.log(error)
        }
    }
}))

export default PenStore
