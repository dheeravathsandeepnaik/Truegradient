import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const fetchNotifications = createAsyncThunk('ui/fetchNotifications', async () => {
  const res = await api.get('/api/notifications');
  return res.data.notifications;
});

export const fetchCredits = createAsyncThunk('ui/fetchCredits', async () => {
  const res = await api.get('/api/user/credits');
  return res.data.credits;
});

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    notifications: [],
    credits: 0,
    notificationOpen: false
  },
  reducers: {
    toggleNotification(state) {
      state.notificationOpen = !state.notificationOpen;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(fetchCredits.fulfilled, (state, action) => {
        state.credits = action.payload;
      });
  }
});

export const { toggleNotification } = uiSlice.actions;
export default uiSlice.reducer;
