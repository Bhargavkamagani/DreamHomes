import { apiClient } from './apiClient.js'

export async function fetchOwnerProjects() {
  const response = await apiClient.get('/owners/projects')
  return response.data
}

export async function createProjectRequest(projectDetails) {
  if (projectDetails instanceof FormData) {
    const response = await apiClient.post('/projects/create-with-image', projectDetails)
    return response.data
  }
  const response = await apiClient.post('/projects/create', projectDetails)
  return response.data
}

export async function fetchProjectDetails(projectId) {
  const response = await apiClient.get(`/projects/${projectId}`)
  return response.data
}

export async function fetchNearbyContractors(pincode) {
  const response = await apiClient.get('/contractors/nearby', { params: pincode ? { pincode } : {} })
  return response.data
}

export async function fetchContractorProfile(contractorId) {
  const response = await apiClient.get(`/contractors/${contractorId}/profile`)
  return response.data
}

export async function fetchNearbySuppliers(pincode) {
  const response = await apiClient.get('/suppliers/nearby', { params: pincode ? { pincode } : {} })
  return response.data
}

export async function fetchSupplierProfile(supplierId) {
  const response = await apiClient.get(`/suppliers/${supplierId}/profile`)
  return response.data
}

export async function fetchIncomingRequests() {
  const response = await apiClient.get('/project-requests/incoming')
  return response.data
}

export async function sendProjectRequest(requestDetails) {
  const response = await apiClient.post('/project-requests/send', requestDetails)
  return response.data
}

export async function acceptProjectRequest(requestId) {
  const response = await apiClient.post('/project-requests/accept', { request_id: requestId })
  return response.data
}

export async function rejectProjectRequest(requestId) {
  const response = await apiClient.post('/project-requests/reject', { request_id: requestId })
  return response.data
}

export async function fetchNearbyProjects() {
  const response = await apiClient.get('/contractors/find-clients')
  return response.data
}

export async function fetchSupplierClients() {
  const response = await apiClient.get('/suppliers/find-clients')
  return response.data
}

export async function fetchNotifications() {
  const response = await apiClient.get('/notifications')
  return response.data
}

export async function markNotificationsRead() {
  const response = await apiClient.post('/notifications/read-all')
  return response.data
}

export async function markModuleNotificationsRead(moduleName) {
  const response = await apiClient.post('/notifications/read-module', null, { params: { module: moduleName } })
  return response.data
}

export async function saveTimelineUpdate(projectId, formData) {
  const response = await apiClient.post(`/timelines/create?project_id=${projectId}`, formData)
  return response.data
}

export async function fetchProjectTimelineEntries(projectId) {
  const response = await apiClient.get(`/timelines/project/${projectId}`)
  return response.data
}

export async function saveMaterialLog(materialDetails) {
  const response = await apiClient.post('/materials/create', materialDetails)
  return response.data
}

export async function saveLabourLog(labourDetails) {
  const response = await apiClient.post('/labour/create', labourDetails)
  return response.data
}

export async function fetchConversations() {
  const response = await apiClient.get('/messages/conversations')
  return response.data
}

export async function fetchConversationMessages(conversationId, params = {}) {
  const response = await apiClient.get(`/messages/conversation/${conversationId}`, { params })
  return response.data
}

export async function sendConversationMessage(messageDetails) {
  const response = await apiClient.post('/messages/send', messageDetails)
  return response.data
}

export async function startConversation(conversationDetails) {
  const response = await apiClient.post('/messages/start', conversationDetails)
  return response.data
}

export async function fetchSupplierProducts() {
  const response = await apiClient.get('/supplier-products')
  return response.data
}

export async function saveSupplierProduct(productDetails) {
  const response = await apiClient.post('/supplier-products', productDetails)
  return response.data
}

export async function deleteSupplierProduct(productId) {
  const response = await apiClient.delete(`/supplier-products/${productId}`)
  return response.data
}
