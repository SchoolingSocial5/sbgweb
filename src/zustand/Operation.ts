import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
    message: string
    count: number
    page_size: number
    results: Operation[]
    data: Operation
    result: FetchResponse
}

export interface Operation {
    _id: string
    livestockNumber: number
    livestockAge: string
    operation: string
    livestock: string
    weight: string
    remark: string
    medication: string
    quantity: string
    staffName: string
    userId: string
    createdAt: Date | null | number
    isChecked?: boolean
    isActive?: boolean
}

export const OperationEmpty = {
    _id: "",
    livestockNumber: 0,
    livestockAge: "",
    operation: "",
    livestock: "",
    weight: "",
    remark: "",
    medication: "",
    quantity: "",
    staffName: '',
    userId: '',
    createdAt: null,
}

interface OperationState {
    count: number
    page_size: number
    operations: Operation[]
    searchedOperations: Operation[]
    loading: boolean
    showOperationForm: boolean
    isAllChecked: boolean
    operationForm: Operation
    setShowOperationForm: (status: boolean) => void
    resetForm: () => void
    setForm: (key: keyof Operation, value: Operation[keyof Operation]) => void
    getOperations: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    setProcessedResults: (data: FetchResponse) => void
    setLoading?: (loading: boolean) => void
    massDelete: (
        url: string,
        selectedoperations: Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    deleteItem: (
        url: string,
        setMessage: (message: string, isError: boolean) => void,
        setLoading?: (loading: boolean) => void
    ) => Promise<void>
    updateOperation: (
        url: string,
        updatedItem: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    createOperation: (
        url: string,
        data: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    toggleChecked: (index: number) => void
    toggleActive: (index: number) => void
    toggleAllSelected: () => void
    reshuffleResults: () => void
    searchOperations: (url: string) => void
}

const OperationStore = create<OperationState>((set) => ({
    count: 0,
    page_size: 0,
    operations: [],
    searchedOperations: [],
    loading: false,
    showOperationForm: false,
    isAllChecked: false,
    operationForm: OperationEmpty,
    resetForm: () =>
        set({
            operationForm: OperationEmpty,
        }),
    setForm: (key, value) =>
        set((state) => ({
            operationForm: {
                ...state.operationForm,
                [key]: value,
            },
        })),

    setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
        if (results) {
            const updatedResults = results.map((item: Operation) => ({
                ...item,
                isChecked: false,
                isActive: false,
            }))

            set({
                count,
                page_size,
                operations: updatedResults,
            })
        }
    },

    setLoading: (loadState: boolean) => {
        set({ loading: loadState })
    },

    setShowOperationForm: (loadState: boolean) => {
        set({ showOperationForm: loadState })
    },

    getOperations: async (url, setMessage) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                setMessage,
                setLoading: OperationStore.getState().setLoading,
            })
            const data = response?.data
            if (data) {
                OperationStore.getState().setProcessedResults(data)
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    reshuffleResults: async () => {
        set((state) => ({
            operations: state.operations.map((item: Operation) => ({
                ...item,
                isChecked: false,
                isActive: false,
            })),
        }))
    },

    searchOperations: _debounce(async (url: string) => {
        const response = await apiRequest<FetchResponse>(url, {
            setLoading: OperationStore.getState().setLoading,
        })
        const results = response?.data.results
        if (results) {
            set({ searchedOperations: results })
        }
    }, 1000),

    massDelete: async (
        url,
        selectedoperations,
        setMessage: (message: string, isError: boolean) => void
    ) => {
        const response = await apiRequest<FetchResponse>(url, {
            method: 'PATCH',
            body: selectedoperations,
            setMessage,
            setLoading: OperationStore.getState().setLoading,
        })
        const data = response?.data
        if (data) {
            OperationStore.getState().setProcessedResults(data)
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
            OperationStore.getState().setProcessedResults(data)
        }
    },

    updateOperation: async (url, updatedItem, setMessage, redirect) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                method: 'PATCH',
                body: updatedItem,
                setMessage,
                setLoading: OperationStore.getState().setLoading,
            })
            const data = response.data
            if (data) {
                OperationStore.getState().setProcessedResults(data.result)
            }
            if (redirect) redirect()
        } catch (error) {
            console.log(error)
        } finally {
            set({ loading: false })
        }
    },

    createOperation: async (url, updatedItem, setMessage, redirect) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                method: 'POST',
                body: updatedItem,
                setMessage,
                setLoading: OperationStore.getState().setLoading,
            })
            const data = response.data
            if (data) {
                OperationStore.getState().setProcessedResults(data.result)
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
            const isCurrentlyActive = state.operations[index]?.isActive
            const updatedResults = state.operations.map((tertiary, idx) => ({
                ...tertiary,
                isActive: idx === index ? !isCurrentlyActive : false,
            }))
            return {
                operations: updatedResults,
            }
        })
    },

    toggleChecked: (index: number) => {
        set((state) => {
            const updatedResults = state.operations.map((tertiary, idx) =>
                idx === index
                    ? { ...tertiary, isChecked: !tertiary.isChecked }
                    : tertiary
            )

            const isAllChecked = updatedResults.every(
                (tertiary) => tertiary.isChecked
            )

            return {
                operations: updatedResults,
                isAllChecked,
            }
        })
    },

    toggleAllSelected: () => {
        set((state) => {
            const isAllChecked =
                state.operations.length === 0 ? false : !state.isAllChecked
            const updatedResults = state.operations.map((item) => ({
                ...item,
                isChecked: isAllChecked,
            }))

            return {
                operations: updatedResults,
                isAllChecked,
            }
        })
    },
}))

export default OperationStore
