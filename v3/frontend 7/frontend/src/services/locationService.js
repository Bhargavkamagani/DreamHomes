import { apiClient } from './apiClient.js'

export async function lookupPincodeArea(pincode) {
  const response = await apiClient.get(`/locations/pincode/${pincode}`)
  return response.data
}
