import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const fetchOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/dashboard/overview');
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to load');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    widgets: null,
    charts: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.widgets = action.payload.widgets;
        state.charts = action.payload.charts;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
