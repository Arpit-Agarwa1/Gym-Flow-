import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
  },
});
