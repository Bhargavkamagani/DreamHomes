import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginUser, signupUser } from '../services/authService.js'

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem('gharbano_auth') || 'null')
  } catch {
    localStorage.removeItem('gharbano_auth')
    return null
  }
}

function apiErrorMessage(error, fallbackMessage) {
  const detail = error.response?.data?.detail
  if (Array.isArray(detail)) return detail[0]?.msg || fallbackMessage
  return detail || fallbackMessage
}

const storedAuth = readStoredAuth()

export const loginWithCredentials = createAsyncThunk('auth/loginWithCredentials', async (credentials, { rejectWithValue }) => {
  try {
    return await loginUser(credentials)
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, 'Unable to login. Please check your credentials.'))
  }
})

export const signupWithProfile = createAsyncThunk('auth/signupWithProfile', async (profileDetails, { rejectWithValue }) => {
  try {
    return await signupUser(profileDetails)
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, 'Unable to create account. Please check the form.'))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedAuth?.user || null,
    accessToken: storedAuth?.accessToken || null,
    refreshToken: storedAuth?.refreshToken || null,
    status: 'idle',
    errorMessage: '',
  },
  reducers: {
    setAuthenticatedUser(state, action) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.errorMessage = ''
      localStorage.setItem('gharbano_auth', JSON.stringify(action.payload))
    },
    logoutUser(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.errorMessage = ''
      localStorage.removeItem('gharbano_auth')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithCredentials.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = ''
      })
      .addCase(loginWithCredentials.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        localStorage.setItem('gharbano_auth', JSON.stringify({
          user: action.payload.user,
          accessToken: action.payload.access_token,
          refreshToken: action.payload.refresh_token,
        }))
      })
      .addCase(loginWithCredentials.rejected, (state, action) => {
        state.status = 'failed'
        state.errorMessage = action.payload || action.error.message
      })
      .addCase(signupWithProfile.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = ''
      })
      .addCase(signupWithProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        localStorage.setItem('gharbano_auth', JSON.stringify({
          user: action.payload.user,
          accessToken: action.payload.access_token,
          refreshToken: action.payload.refresh_token,
        }))
      })
      .addCase(signupWithProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.errorMessage = action.payload || action.error.message
      })
  },
})

export const { logoutUser, setAuthenticatedUser } = authSlice.actions
export default authSlice.reducer
