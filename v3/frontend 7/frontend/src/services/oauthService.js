import { apiClient } from './apiClient.js'

export function googleOAuthUrl(role = 'OWNER') {
  return `${apiClient.defaults.baseURL}/auth/oauth/google/start?role=${role}`
}

export function microsoftOAuthUrl(role = 'OWNER') {
  return `${apiClient.defaults.baseURL}/auth/oauth/microsoft/start?role=${role}`
}

export function startGoogleOAuth(role = 'OWNER') {
  window.location.assign(googleOAuthUrl(role))
}

export function startMicrosoftOAuth(role = 'OWNER') {
  window.location.assign(microsoftOAuthUrl(role))
}
