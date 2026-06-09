import axios from 'axios'

function defaultApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000'
  }
  return 'http://localhost:8000'
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl(),
})

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem('gharbano_auth') || 'null')
  } catch {
    localStorage.removeItem('gharbano_auth')
    return null
  }
}

apiClient.interceptors.request.use((config) => {
  const storedAuth = readStoredAuth()
  if (storedAuth?.accessToken) {
    config.headers.Authorization = `Bearer ${storedAuth.accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gharbano_auth')
      window.dispatchEvent(new Event('gharbano_auth_expired'))
    }
    return Promise.reject(error)
  },
)

export function imageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${apiClient.defaults.baseURL}${path}`
}

export function websocketUrl(path) {
  const baseUrl = apiClient.defaults.baseURL.replace(/^http/, 'ws')
  return `${baseUrl}${path}`
}
