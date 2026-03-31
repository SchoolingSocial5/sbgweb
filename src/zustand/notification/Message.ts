import { create } from 'zustand'

export interface Alert {
  title: string
  text: string
  display: boolean
  action: (() => void) | null // Function that runs on "Continue"
  cancel: () => void
  setAlert: (
    title: string,
    text: string,
    display: boolean,
    action?: () => void
  ) => void
  continue: () => void
}

export interface Message {
  baseURL: string
  ip: string
  messageContent: string
  messageGreetings: string
  messageTitle: string
  isBoxVisible: boolean
  isSuccess: boolean | null
  message: string | null
  online: boolean | null
  clearMessage: () => void
  setBaseUrl: (url: string) => void
  setBoxVisibility: (state: boolean) => void
  setIp: (url: string) => void
  setMessage: (newMessage: string, isSuccess: boolean) => void
  setMessageContent: (newMessage: string) => void
  setMessageGreeting: (newMessage: string) => void
  setMessageTitle: (newMessage: string) => void
  setOnline: (newMessage: string, isSuccess: boolean) => void
}

export const MessageStore = create<Message>((set) => ({
  message: null,
  isSuccess: null,
  online: true,
  isBoxVisible: false,
  baseURL: '',
  ip: '',
  messageContent: '',
  messageGreetings: '',
  messageTitle: '',

  setBoxVisibility: (state: boolean) => {
    set(() => ({
      isBoxVisible: state,
    }))
  },
  setMessageContent: (content: string) => {
    set(() => ({
      messageContent: content,
    }))
  },

  setMessageGreeting: (greetings: string) => {
    set(() => ({
      messageGreetings: greetings,
    }))
  },

  setMessageTitle: (title: string) => {
    set(() => ({
      messageTitle: title,
    }))
  },

  setBaseUrl: (url: string) => {
    set(() => ({
      baseURL: url,
    }))
  },

  clearMessage: () =>
    set(() => ({
      message: null,
      isSuccess: null,
    })),

  setIp: (ip: string) => {
    set(() => ({
      ip: ip,
    }))
  },

  setMessage: (newMessage, isSuccess) => {
    set(() => ({
      message: newMessage,
      isSuccess,
    }))

    setTimeout(() => {
      set(() => ({
        message: null,
        isSuccess: null,
      }))
    }, 10000)
  },
  setOnline: (newMessage, isSuccess) => {
    if (!newMessage) return
    set(() => ({
      message: newMessage,
      isSuccess: isSuccess,
      online: isSuccess,
    }))

    setTimeout(() => {
      set(() => ({
        message: null,
        isSuccess: null,
      }))
    }, 5000)
  },
}))

export const AlartStore = create<Alert>((set) => ({
  title: '',
  text: '',
  display: false,
  action: null,

  cancel: () => {
    set(() => ({
      display: false,
      action: null,
    }))
  },
  setAlert: (
    title: string,
    text: string,
    display: boolean,
    action?: () => void
  ) => {
    set(() => ({
      display: display,
      title: title,
      text: text,
      action: action || null, // Store function or null
    }))
  },
  continue: () =>
    set((state) => {
      if (state.action) state.action()
      return { display: false, action: null }
    }),
}))
