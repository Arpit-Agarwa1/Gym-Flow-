import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { setAuthTokenGetter } from './api/axios.js';
import { store } from './store/store.js';
import './index.css';

/** Ensure API calls always read the latest JWT from Redux (no useEffect race). */
setAuthTokenGetter(() => store.getState().auth.token);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
