import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ProfileState {
  fullName: string
  completion: number
  cvFileName: string
}

const initialState: ProfileState = {
  fullName: '',
  completion: 0,
  cvFileName: '',
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Partial<ProfileState>>) {
      return { ...state, ...action.payload }
    },
    setCompletion(state, action: PayloadAction<number>) {
      state.completion = action.payload
    },
    resetProfile() {
      return initialState
    },
  },
})

export const { setProfile, setCompletion, resetProfile } = profileSlice.actions
export default profileSlice.reducer
