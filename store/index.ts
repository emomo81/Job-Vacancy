import { configureStore, combineReducers, Middleware } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import uiReducer from './slices/uiSlice'

const PERSIST_KEY = 'rankr_redux_state'

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  ui: uiReducer,
})

export type RootState = ReturnType<typeof rootReducer>

function loadState(): Partial<RootState> | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw)
    return { auth: parsed.auth, profile: parsed.profile }
  } catch {
    return undefined
  }
}

const persistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  if (typeof window !== 'undefined') {
    try {
      const state = store.getState() as RootState
      localStorage.setItem(PERSIST_KEY, JSON.stringify({ auth: state.auth, profile: state.profile }))
    } catch {
      /* ignore quota errors */
    }
  }
  return result
}

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
  middleware: (getDefault) => getDefault().concat(persistMiddleware),
})

export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
