import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'candidate' | 'recruiter' | 'admin' | ''
  organizationId?: string | null
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; accessToken: string }>) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    clearCredentials(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, updateUser, clearCredentials } = authSlice.actions
export default authSlice.reducer
