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
    pen: string
    penId: string
    productionData: { columnId: string; name: string; units: number }[]
    productId: string
    productName: string
    unitName: string
    unitPerPurchase: number
    staffName: string
    userId: string
    type: string
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
    pen: "",
    penId: "",
    productionData: [],
    productId: "",
    productName: "",
    unitName: "",
    unitPerPurchase: 1,
    staffName: '',
    userId: '',
    type: '',
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
    pendingOperations: Operation[]
    editingPendingIndex: number | null
    currentFilter: string
    setShowOperationForm: (status: boolean) => void
    setCurrentFilter: (filter: string) => void
    resetForm: () => void
    setForm: (key: keyof Operation, value: Operation[keyof Operation]) => void
    addPendingOperation: (op: Operation) => void
    removePendingOperation: (index: number) => void
    updatePendingOperation: (index: number, op: Operation) => void
    setEditingPendingIndex: (index: number | null) => void
    clearPendingOperations: () => void
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
        updatedItem: any,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    createOperation: (
        url: string,
        data: any,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    toggleChecked: (index: number) => void
    toggleActive: (index: number) => void
    toggleAllSelected: () => void
    reshuffleResults: () => void
    searchOperations: (url: string) => void
    getPerformanceSummary: (
        dateFrom: string,
        dateTo: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    performanceSummary: any[]
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
    pendingOperations: [],
    editingPendingIndex: null,
    currentFilter: '',
    performanceSummary: [],
    resetForm: () =>
        set({
            operationForm: OperationEmpty,
            editingPendingIndex: null,
        }),
    setForm: (key, value) =>
        set((state) => ({
            operationForm: {
                ...state.operationForm,
                [key]: value,
            },
        })),

    addPendingOperation: (op) =>
        set((state) => ({
            pendingOperations: [...state.pendingOperations, op],
        })),

    removePendingOperation: (index) =>
        set((state) => ({
            pendingOperations: state.pendingOperations.filter((_, i) => i !== index),
        })),

    updatePendingOperation: (index, op) =>
        set((state) => {
            const updated = [...state.pendingOperations]
            updated[index] = op
            return { pendingOperations: updated }
        }),

    setEditingPendingIndex: (index) => set({ editingPendingIndex: index }),

    setCurrentFilter: (filter) => set({ currentFilter: filter }),

    clearPendingOperations: () =>
        set({
            pendingOperations: [],
            editingPendingIndex: null,
        }),

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

    updateOperation: async (url, body: any, setMessage, redirect) => {
        try {
            set({ loading: true })
            const response = await apiRequest<FetchResponse>(url, {
                method: 'PATCH',
                body: body,
                setMessage,
                isMultipart: body instanceof FormData,
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

    createOperation: async (url, body: any, setMessage, redirect) => {
        try {
            set({ loading: true })

            // Handle injecting createdAt
            let finalBody = body;
            if (body instanceof FormData) {
                if (!body.has('createdAt')) body.append('createdAt', new Date().toISOString());
            } else if (Array.isArray(body)) {
                finalBody = body.map(item => ({ ...item, createdAt: item.createdAt || new Date() }));
            } else {
                finalBody = { ...body, createdAt: body.createdAt || new Date() };
            }

            const response = await apiRequest<FetchResponse>(url, {
                method: 'POST',
                body: finalBody,
                setMessage,
                isMultipart: body instanceof FormData,
                setLoading: OperationStore.getState().setLoading,
            })
            const data = response.data
            if (data) {
                OperationStore.getState().setProcessedResults(data.result)
            }
            if (redirect) redirect()
        } catch (error: any) {
            console.log(error)
            // Save offline if network error
            if (!error.response || error.code === 'ECONNABORTED') {
                const { offlineDb } = await import('@/lib/offlineDb');

                let storageBody = body;
                if (body instanceof FormData) {
                    storageBody = Object.fromEntries(body.entries());
                }

                await offlineDb.saveRecord({
                    type: 'production',
                    url,
                    body: storageBody,
                });

                if (setMessage) setMessage('Operation saved offline.', true);
                if (redirect) redirect();
            }
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

    getPerformanceSummary: async (dateFrom, dateTo, setMessage) => {
        try {
            const url = `/operations/performance-summary?dateFrom=${dateFrom}&dateTo=${dateTo}`
            const response = await apiRequest<any[]>(url, {
                setMessage,
                setLoading: OperationStore.getState().setLoading,
            })
            const data = response?.data
            if (data) {
                set({ performanceSummary: data })
            }
        } catch (error) {
            console.log(error)
        }
    },
}))

export default OperationStore
