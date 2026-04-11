import { AuthStore } from '@/src/zustand/user/AuthStore'
import { User } from '@/src/zustand/user/User'
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios'
const apiClient = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_PROD_API_URL
      : process.env.NEXT_PUBLIC_DEV_API_URL,
  timeout: 10000, // 10 seconds as requested for "bad network"
})

apiClient.interceptors.request.use((config) => {
  const { token } = AuthStore.getState()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token.trim()}`
  } else {
    console.warn('No token.')
  }
  return config
})

export type ApiResponse = {
  message?: string
  id?: string
  [key: string]: any
} | any[]

export const apiRequest = async <T extends ApiResponse>(
  url: string,
  options: {
    method?: Method
    body?: unknown
    params?: Record<string, unknown>
    headers?: Record<string, string>
    isMultipart?: boolean
    setMessage?: (message: string, isError: boolean) => void
    setLoading?: (loading: boolean) => void
    setProgress?: (progress: number) => void
  } = {}
): Promise<AxiosResponse<T>> => {
  const {
    method = 'GET',
    body,
    params,
    headers = {},
    isMultipart = false,
    setMessage,
    setLoading,
  } = options

  const config: AxiosRequestConfig = {
    url,
    method,
    params,
    headers: {
      ...headers,
      ...(isMultipart ? { 'content-type': 'multipart/form-data' } : {}),
    },
    data: body
      ? (isMultipart && !(body instanceof FormData))
        ? toFormData(body as Record<string, unknown>)
        : body
      : undefined,
  }

  try {
    if (setLoading) setLoading(true)
    const response = await apiClient.request<T>(config)
    if (response.data && !Array.isArray(response.data) && (response.data as any).message && setMessage) {
      setMessage((response.data as any).message, true)
    }
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (setMessage && error.response?.data?.message) {
        setMessage(error.response.data.message, false)
      } else if (setMessage && (error.code === 'ECONNABORTED' || !error.response)) {
        // This is where "bad network" or "no internet" is caught
        setMessage('Network issue detected. Record will reside in offline queue.', false)
      }
      throw error
    } else {
      throw error
    }
  } finally {
    if (setLoading) setLoading(false)
  }
}

const toFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    const value = data[key]
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string' || item instanceof Blob) {
          formData.append(`${key}[]`, item)
        } else {
          formData.append(`${key}[]`, JSON.stringify(item)) // Convert non-string/Blob to JSON string
        }
      })
    } else if (typeof value === 'string' || value instanceof Blob) {
      formData.append(key, value)
    } else {
      formData.append(key, JSON.stringify(value)) // Convert non-string/Blob to JSON string
    }
  })
  return formData
}

export default apiRequest

export interface ApiResponseInterface {
  results: unknown[]
  token: string
  message: string
  count: number
  data: ResponseData
  user: User
}

interface ResponseData {
  map(arg0: (item: unknown) => unknown): unknown
  count: number
  user: User
  tokens: unknown
  results: unknown[]
}
