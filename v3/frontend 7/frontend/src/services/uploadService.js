import { apiClient } from './apiClient.js'

export async function uploadLocalFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post('/files/upload', formData)
  return response.data
}
