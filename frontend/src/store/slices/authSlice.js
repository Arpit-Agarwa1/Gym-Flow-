import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

const STORAGE_KEY = 'gymflow_auth';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Register failed');
    }
  }
);

const initial = loadStored();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initial.user,
    token: initial.token,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem(STORAGE_KEY);
    },
    hydrate(state) {
      const s = loadStored();
      state.user = s.user;
      state.token = s.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: state.user, token: state.token })
        );
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error';
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: state.user, token: state.token })
        );
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error';
      });
  },
});

export const { logout, hydrate } = authSlice.actions;
export default authSlice.reducer;
