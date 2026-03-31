import _debounce from 'lodash/debounce'
import apiRequest from './axios'
import { UAParser } from 'ua-parser-js'

export interface FetchResponse {
  message: string
  count: number
  page_size: number
  length: number
}

interface UsernameSearchParams {
  setMessage: (message: string, success: boolean) => void
  setIsLoading: (loading: boolean) => void
}

export const createUsernameSearchHandler = ({
  setMessage,
  setIsLoading,
}: UsernameSearchParams) =>
  _debounce(async (value: string, url: string): Promise<string> => {
    const trimmedValue = value.trim()
    const validation = validateUsername(trimmedValue)

    if (!validation.valid) {
      setMessage(validation.message, false)
      setIsLoading(false)
      return ''
    }

    setIsLoading(true)

    const response = await apiRequest<FetchResponse>(url)
    const results = response?.data

    if (results) {
      setMessage('Sorry! This username is already taken', false)
      setIsLoading(false)
      return ''
    } else {
      setMessage('Great! The username is available', true)
      setIsLoading(false)
      return trimmedValue
    }
  }, 1000)


export function capitalizeFirstLetter(str: string) {
  if (!str) return '' // handle empty string
  return str.charAt(0).toUpperCase() + str.slice(1)
}



export const getAge = (dob: string | Date): number => {
  const birthDate = new Date(dob)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export const countText = (content: string): number => {
  const plainText = content.replace(/<[^>]+>/g, '')
  return plainText.trim().length
}

export const isStringLengthValid = (
  content: string,
  length: number
): boolean => {
  if (content.replace(/<[^>]*>/g, '').trim().length < length) {
    return false
  } else {
    return true
  }
}

export const getDeviceInfo = () => {
  const parser = new UAParser()
  const result = parser.getResult()

  return {
    os: result.os.name || 'Unknown OS',
    osVersion: result.os.version || '',
    browser: result.browser.name || 'Unknown Browser',
    browserVersion: result.browser.version || '',
    device: result.device.model || 'Desktop',
  }
}

export const formatRelatedDate = (dateString: string | Date | number) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.toDateString() === today.toDateString();

  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return formatDateToDDMMYY(dateString);
};




export const appendForm = (inputs: Input[]): FormData => {
  const data = new FormData()

  inputs.forEach((el) => {
    if (el.value !== null && el.value !== undefined) {
      if (el.value instanceof File) {
        // Append file object directly
        data.append(el.name, el.value)
      } else {
        // Convert other types to string and append
        data.append(el.name, String(el.value).trim())
      }
    }
  })

  return data
}


export const formatMoney = (value: number | string): string => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return '0'

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const formatCount = (num: number): string => {
  if (!num) {
    return '0'
  }
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

export const formatDate = (dateInput: Date | string): string => {
  const date = new Date(dateInput)

  // Months array
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Get the day, month, and year
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  // Determine the day suffix
  const getDaySuffix = (day: number): string => {
    if (day % 10 === 1 && day !== 11) return 'st'
    if (day % 10 === 2 && day !== 12) return 'nd'
    if (day % 10 === 3 && day !== 13) return 'rd'
    return 'th'
  }

  // Format the date
  return `${month} ${day}${getDaySuffix(day)}, ${year}`
}

export const formatDateToDDMMYY = (
  dateInput: Date | null | number | string
): string => {
  if (dateInput) {
    const date = new Date(dateInput)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  } else {
    return `Incorrect Date`
  }
}

export const formatRelativeDate = (dateInput: Date | string): string => {
  const now = new Date()
  const date = new Date(dateInput)

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 0) {
    return 'now'
  }

  const minute = 60
  const hour = 3600
  const day = 86400
  const week = 604800
  const month = 2592000 // ~30 days
  const year = 31536000 // 365 days

  if (diffInSeconds < minute) {
    return 'now'
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute)
    return `${minutes} min${minutes !== 1 ? 's' : ''}`
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour)
    return `${hours} hr${hours !== 1 ? 's' : ''}`
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day)
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week)
    return `${weeks} wk${weeks !== 1 ? 's' : ''}`
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month)
    return `${months} mo${months !== 1 ? 's' : ''}`
  } else {
    const years = Math.floor(diffInSeconds / year)
    return `${years} yr${years !== 1 ? 's' : ''}`
  }
}

export const formatTimeTo12Hour = (
  dateInput: Date | null | number | string
): string => {
  if (dateInput) {
    const date = new Date(dateInput)
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes} ${ampm}`
  } else {
    return `Incorrect Date`
  }
}

interface Input {
  name: string
  value: string | number | boolean | File | null | Date
}


export const validateUsername = (username: string) => {
  const regex = /^[\w!@#$%^&*()_+={}\[\]:;"'<>,.?/|\\~`]{2,}$/
  if (regex.test(username)) {
    return { valid: true, message: 'Valid username' }
  } else {
    return {
      valid: false,
      message:
        'Invalid username. It should contain at least 2 alphanumeric characters, underscore or special symbols without spaces or hyphens.',
    }
  }
}
