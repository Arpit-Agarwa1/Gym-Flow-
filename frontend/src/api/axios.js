import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
  timeout: 25000,
});

export default api;
