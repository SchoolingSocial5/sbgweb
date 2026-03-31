import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

export interface Course {
  _id: string
  level: number
  semester: number
  courseCode: string
  load: number
  schoolId: string
  facultyId: string
  departmentId: string
  department: string
  name: string
  picture: File | string | null
  media: File | string | null
  description: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}

export interface Subject {
  _id: string
  country: string
  state: string
  schemeOfWork: string
  schoolUsername: string
  levelName: string
  curriculumTitle: string
  level: number
  maxLevel: number
  term: number
  subjectCode: string
  name: string
  picture: string | File
  description: string
  isChecked?: boolean
  isActive?: boolean
}

export const CourseEmpty = {
  _id: '',
  level: 0,
  semester: 0,
  courseCode: '',
  load: 0,
  schoolId: '',
  facultyId: '',
  departmentId: '',
  department: '',
  name: '',
  picture: '',
  media: '',
  description: '',
  createdAt: null,
}

export const SubjectEmpty = {
  _id: '',
  country: '',
  state: '',
  schemeOfWork: '',
  schoolUsername: '',
  levelName: '',
  level: 0,
  term: 0,
  maxLevel: 0,
  subjectCode: '',
  name: '',
  curriculumTitle: '',
  picture: '',
  description: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Course[]
}

interface FetchSubjectResponse {
  message: string
  count: number
  page_size: number
  results: Subject[]
  data: Subject
}

interface CourseState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  subjects: Subject[]
  courses: Course[]
  loading: boolean
  isSubject: boolean
  isScheme: boolean
  displaySubjects: boolean
  error: string | null
  successs?: string | null
  selectedItems: Course[]
  searcheditems: Course[]
  searchedSubjects: Subject[]
  selectedSubjects: Subject[]
  isAllChecked: boolean
  subject: Subject
  courseForm: Course
  setForm: (key: keyof Course, value: Course[keyof Course]) => void
  setSubject: (key: keyof Subject, value: Subject[keyof Subject]) => void
  setIsSubject: (status: boolean) => void
  setIsScheme: (status: boolean) => void
  setDisplaySubjects: (status: boolean) => void
  resetForm: () => void
  getCourses: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getSubjects: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getSubject: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    runFunction?: () => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  processSubject: (data: FetchSubjectResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    refreshUrl: string,
    selectedItems: Course[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  deleteSubject: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    runFunction?: () => void
  ) => Promise<void>

  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateSubject: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    runFunction?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postSubject: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    runFunction?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleCheckedSubject: (id: string) => void
  toggleActiveSubject: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleSubjects: () => void
  searchSubject: (url: string) => void
}

const CourseStore = create<CourseState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 20,
  courses: [],
  subjects: [],
  loading: false,
  isSubject: false,
  isScheme: false,
  displaySubjects: false,
  error: null,
  selectedItems: [],
  searchedSubjects: [],
  selectedSubjects: [],
  searcheditems: [],
  isAllChecked: false,
  subject: SubjectEmpty,
  courseForm: CourseEmpty,
  setForm: (key, value) =>
    set((state) => ({
      courseForm: {
        ...state.courseForm,
        [key]: value,
      },
    })),
  setSubject: (key, value) =>
    set((state) => ({
      subject: {
        ...state.subject,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      courseForm: CourseEmpty,
    }),

  setDisplaySubjects: (loadState: boolean) => {
    set({ displaySubjects: loadState })
  },

  setIsSubject: (loadState: boolean) => {
    set({ isSubject: loadState })
  },

  setIsScheme: (loadState: boolean) => {
    set({ isScheme: loadState })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Course) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        courses: updatedResults,
      })
    }
  },

  processSubject: ({ count, page_size, results }: FetchSubjectResponse) => {
    if (results) {
      const updatedResults = results.map((item: Subject) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        subjects: updatedResults,
      })
    }
  },

  getCourses: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: CourseStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        CourseStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getSubject: async (url, setMessage, runFunction) => {
    try {
      const response = await apiRequest<FetchSubjectResponse>(url, {
        setLoading: CourseStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ subject: data.data })
      }
      if (runFunction) runFunction()
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getSubjects: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchSubjectResponse>(url, {
        setLoading: CourseStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        CourseStore.getState().processSubject(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleSubjects: async () => {
    set((state) => ({
      selectedSubjects: [],
      courses: state.courses.map((item: Course) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchSubject: _debounce(async (url: string) => {
    const response = await apiRequest<FetchSubjectResponse>(url)
    const results = response?.data.results
    if (results) {
      const updatedResults = results.map((item: Subject) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedSubjects: updatedResults })
    }
  }, 1000),

  massDelete: async (
    url: string,
    refreshUrl: string,
    selectedItems: Course[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      setMessage,
      body: selectedItems,
    })
    if (response) {
      const getCourses = get().getCourses
      getCourses(refreshUrl, setMessage)
    }
  },

  deleteSubject: async (url, setMessage, runFunction) => {
    const response = await apiRequest<FetchSubjectResponse>(url, {
      method: 'DELETE',
      setMessage,
    })

    const data = response?.data
    if (data) {
      CourseStore.getState().processSubject(data)
    }
    if (runFunction) runFunction()
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
      CourseStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: CourseStore.getState().setLoading,
    })
    if (response?.data) {
      CourseStore.getState().setProcessedResults(response.data)
    }
  },

  updateSubject: async (url, updatedItem, setMessage, runFunction) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchSubjectResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: CourseStore.getState().setLoading,
    })
    if (response?.data) {
      CourseStore.getState().processSubject(response.data)
    }
    if (runFunction) runFunction()
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: CourseStore.getState().setLoading,
    })
    if (response?.data) {
      CourseStore.getState().setProcessedResults(response.data)
    }
  },

  postSubject: async (url, updatedItem, setMessage, runFunction) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchSubjectResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: CourseStore.getState().setLoading,
    })
    if (response?.data) {
      CourseStore.getState().processSubject(response.data)
    }
    if (runFunction) runFunction()
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.courses[index]?.isActive
      const updatedResults = state.courses.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        courses: updatedResults,
      }
    })
  },

  toggleActiveSubject: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.subjects[index]?.isActive
      const updatedResults = state.subjects.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        subjects: updatedResults,
      }
    })
  },

  toggleCheckedSubject: (id) => {
    set((state) => {
      const updatedResults = state.subjects.map((tertiary) =>
        tertiary._id === id
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        subjects: updatedResults,
        selectedSubjects: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.courses.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        courses: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.courses.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.courses.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        courses: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default CourseStore
