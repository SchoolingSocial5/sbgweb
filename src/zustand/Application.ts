import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
    message: string
    count: number
    page_size: number
    results: Application[]
    data: Application
    result: FetchResponse
}

export interface Application {
    _id: string
    firstName: string
    middleName: string
    lastName: string

    gender: string
    maritalStatus: string
    dob: Date | string | null,

    nationality: string
    state: string
    lga: string
    homeAddress: string

    residenceCountry: string
    residenceState: string
    residenceLga: string
    residenceAddress: string

    phone: string
    email: string

    refereeName: string
    refereePhone: string
    refereeRelationship: string
    applicationLetter: string

    school: string
    course: string
    degree: string

    position: string
    username: string
    certificateUrl: string
    photoUrl: string
    createdAt: Date | null
    isChecked?: boolean
    isActive?: boolean
}

export const ApplicationEmpty = {
    _id: '',
    firstName: '',
    middleName: '',
    lastName: '',

    gender: '',
    maritalStatus: '',
    dob: '',

    nationality: '',
    state: '',
    lga: '',
    homeAddress: '',

    residenceCountry: '',
    residenceState: '',
    residenceLga: '',
    residenceAddress: '',

    phone: '',
    email: '',

    refereeName: '',
    refereePhone: '',
    refereeRelationship: '',
    applicationLetter: '',

    school: '',
    course: '',
    degree: '',

    position: '',
    username: '',
    certificateUrl: '',
    photoUrl: '',
    createdAt: null
}

interface ApplicantState {
    count: number
    page_size: number
    applicants: Application[]
    selectedApplicants: Application[]
    loading: boolean
    isAllChecked: boolean
    applicationForm: Application
    resetForm: () => void
    setForm: (key: keyof Application, value: Application[keyof Application]) => void
    getApplications: (
        url: string,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    setProcessedResults: (data: FetchResponse) => void
    setLoading?: (loading: boolean) => void
    massDelete: (
        url: string,
        selectedApplicants: Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void
    ) => Promise<void>
    deleteItem: (
        url: string,
        setMessage: (message: string, isError: boolean) => void,
        setLoading?: (loading: boolean) => void
    ) => Promise<void>
    updateApplication: (
        url: string,
        updatedItem: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    createApplication: (
        url: string,
        data: FormData | Record<string, unknown>,
        setMessage: (message: string, isError: boolean) => void,
        redirect?: () => void
    ) => Promise<void>
    toggleChecked: (index: number) => void
    toggleActive: (index: number) => void
    toggleAllSelected: () => void
    reshuffleResults: () => void
}

const ApplicationStore = create<ApplicantState>((set) => ({
    count: 0,
    page_size: 0,
    applicants: [],
    selectedApplicants: [],
    loading: false,
    isAllChecked: false,
    applicationForm: ApplicationEmpty,
    resetForm: () =>
        set({
            applicationForm: ApplicationEmpty,
        }),

    setForm: (key, value) =>
        set((state) => ({
            applicationForm: {
                ...state.applicationForm,
                [key]: value,
            },
        })),

    setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
        if (results) {
            const updatedResults = results.map((item: Application) => ({
                ...item,
                isChecked: false,
                isActive: false,
            }))

            set({
                count,
                page_size,
                applicants: updatedResults,
            })
        }
    },

    setLoading: (loadState: boolean) => {
        set({ loading: loadState })
    },


    getApplications: async (url, setMessage) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                setMessage,
                setLoading: ApplicationStore.getState().setLoading,
            })
            const data = response?.data
            if (data) {
                ApplicationStore.getState().setProcessedResults(data)
            }
        } catch (error: unknown) {
            console.log(error)
        }
    },

    reshuffleResults: async () => {
        set((state) => ({
            applicants: state.applicants.map((item: Application) => ({
                ...item,
                isChecked: false,
                isActive: false,
            })),
        }))
    },

    massDelete: async (
        url,
        selectedApplicants,
        setMessage: (message: string, isError: boolean) => void
    ) => {
        const response = await apiRequest<FetchResponse>(url, {
            method: 'PATCH',
            body: selectedApplicants,
            setMessage,
            setLoading: ApplicationStore.getState().setLoading,
        })
        const data = response?.data
        if (data) {
            ApplicationStore.getState().setProcessedResults(data)
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
            ApplicationStore.getState().setProcessedResults(data)
        }
    },

    updateApplication: async (url, updatedItem, setMessage, redirect) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                method: 'PATCH',
                body: updatedItem,
                setMessage,
                setLoading: ApplicationStore.getState().setLoading,
            })
            const data = response.data
            if (data) {
                ApplicationStore.getState().setProcessedResults(data.result)
            }
            if (redirect) redirect()
        } catch (error) {
            console.log(error)
        } finally {
            set({ loading: false })
        }
    },

    createApplication: async (url, updatedItem, setMessage, redirect) => {
        try {
            const response = await apiRequest<FetchResponse>(url, {
                method: 'POST',
                body: updatedItem,
                setMessage,
                setLoading: ApplicationStore.getState().setLoading,
            })
            const data = response.data
            if (data) {
                ApplicationStore.getState().setProcessedResults(data.result)
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
            const isCurrentlyActive = state.applicants[index]?.isActive
            const updatedResults = state.applicants.map((tertiary, idx) => ({
                ...tertiary,
                isActive: idx === index ? !isCurrentlyActive : false,
            }))
            return {
                applicants: updatedResults,
            }
        })
    },

    toggleChecked: (index: number) => {
        set((state) => {
            const updatedResults = state.applicants.map((tertiary, idx) =>
                idx === index
                    ? { ...tertiary, isChecked: !tertiary.isChecked }
                    : tertiary
            )

            const isAllChecked = updatedResults.every(
                (tertiary) => tertiary.isChecked
            )

            return {
                applicants: updatedResults,
                isAllChecked,
            }
        })
    },

    toggleAllSelected: () => {
        set((state) => {
            const isAllChecked =
                state.applicants.length === 0 ? false : !state.isAllChecked
            const updatedResults = state.applicants.map((item) => ({
                ...item,
                isChecked: isAllChecked,
            }))

            return {
                applicants: updatedResults,
                isAllChecked,
            }
        })
    },
}))

export default ApplicationStore
