import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Toast {
  id: string
  variant: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

interface UiState {
  toasts: Toast[]
  sidebarOpen: boolean
}

const initialState: UiState = {
  toasts: [],
  sidebarOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pushToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      state.toasts.push({ ...action.payload, id: `${Date.now()}-${Math.random()}` })
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
  },
})

export const { pushToast, dismissToast, setSidebarOpen } = uiSlice.actions
export default uiSlice.reducer
