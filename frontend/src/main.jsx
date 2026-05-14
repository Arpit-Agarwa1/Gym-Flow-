import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { setAuthTokenGetter, setUnauthorizedHandler } from './api/axios.js';
import { store } from './store/store.js';
import { logout } from './store/slices/authSlice.js';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './index.css';

/** Ensure API calls always read the latest JWT from Redux (no useEffect race). */
setAuthTokenGetter(() => store.getState().auth.token);

/** Invalid/expired JWT (e.g. DB wiped or JWT_SECRET rotated on Render) → clear storage + login. */
setUnauthorizedHandler(() => {
  store.dispatch(logout());
  const p = window.location.pathname || '';
  if (
    p.startsWith('/login') ||
    p.startsWith('/register') ||
    p.startsWith('/forgot-password')
  ) {
    return;
  }
  window.location.assign('/login');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
