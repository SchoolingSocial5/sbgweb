import { create } from 'zustand'
import apiRequest from '@/lib/axios'

export interface Notification {
  _id: string
  picture: string
  title: string
  username: string
  content: string
  fullName: string
  greetings: string
  unread: boolean
  createdAt: Date | string
  isChecked?: boolean
  isActive?: boolean
}

interface FetchNotificationResponse {
  message: string
  count: number
  page_size: number
  unread: number
  results: Notification[]
}

interface NotificationState {
  count: number
  unread: number
  activitiesCount: number
  uniqueCount: number
  page_size: number
  notifications: Notification[]
  loading: boolean
  selectedItems: Notification[]
  isAllChecked: boolean
  getNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  processedNotifications: (data: FetchNotificationResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Notification[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteNotification: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateNotification: (
    url: string,
    updatedItem: Record<string, unknown>
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleNotifications: () => void
}

const NotificationStore = create<NotificationState>((set) => ({
  links: null,
  count: 0,
  unread: 0,
  page_size: 20,
  activitiesCount: 0,
  uniqueCount: 0,
  notifications: [],
  loading: false,
  selectedItems: [],
  isAllChecked: false,

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  processedNotifications: ({
    count,
    page_size,
    results,
  }: FetchNotificationResponse) => {
    if (results) {
      const updatedResults = results.map((item: Notification) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        notifications: updatedResults,
      })
    }
  },

  getNotifications: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchNotificationResponse>(url, {
        setMessage,
        setLoading: NotificationStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        NotificationStore.getState().processedNotifications(data)
        set({ unread: data.unread })
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  reshuffleNotifications: async () => {
    set((state) => ({
      notifications: state.notifications.map((item: Notification) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  massDelete: async (
    url: string,
    selectedItems: Notification[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    await apiRequest<FetchNotificationResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
    })
  },

  deleteNotification: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    await apiRequest<FetchNotificationResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: NotificationStore.getState().setLoading,
    })
  },

  updateNotification: async (url, updatedItem) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchNotificationResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setLoading: NotificationStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        set({ unread: data.unread })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.notifications[index]?.isActive
      const updatedResults = state.notifications.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        notifications: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.notifications.map((tertiary, idx) =>
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
        notifications: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.notifications.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.notifications.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        notifications: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default NotificationStore
