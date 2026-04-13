import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Determine base URL (default to localhost API if not in env)
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Zustand stores persist data in localStorage conditionally, or we can read it directly from store
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Skip interceptor if the request is to a login route
      if (error.config.url && error.config.url.includes('login')) {
        return Promise.reject(error);
      }

      // Get the logout function from the store
      const { logout } = useAuthStore.getState();
      logout();
      
      // Redirect to login if on client side
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
