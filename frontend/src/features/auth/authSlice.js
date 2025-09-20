import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const signIn = createAsyncThunk('auth/signIn', async (credentials) => {
  const res = await api.post('/api/auth/login', credentials);
  return res.data;
});

export const signUp = createAsyncThunk('auth/signUp', async (credentials) => {
  const res = await api.post('/api/auth/signup', credentials);
  return res.data;
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async () => {
  const res = await api.get('/api/user/me');
  return res.data.user;
});

const token = localStorage.getItem('token');
const initialState = {
  token: token || null,
  user: null,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.fulfilled, (state, action) => {
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
