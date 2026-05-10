/* Axios-based API service layer with retry, timeout, and JWT interception */
import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const MAX_RETRIES = 2;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000, /* 8-second timeout for production resilience */
  headers: {
    'Content-Type': 'application/json',
  },
});

/* Request Interceptor — inject JWT token */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Response Interceptor — retry logic and error normalization */
apiClient.interceptors.response.use(
  (response) => response.data, /* Unwrap nested data */
  async (error) => {
    const config = error.config;
    
    /* Ignore retries for user-related 4xx errors */
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
       return Promise.reject(error.response.data || error.message);
    }

    /* Retry logic for 5xx or network errors */
    const method = (config?.method || 'get').toLowerCase();
    const retryCount = config?._retryCount || 0;
    if (config && RETRYABLE_METHODS.has(method) && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;
      const backoffDelay = new Promise((resolve) => setTimeout(resolve, config._retryCount * 500));
      await backoffDelay;
      return apiClient(config);
    }

    return Promise.reject(
      error.response?.data || { success: false, error: error.message || 'Network error occurred' }
    );
  }
);

/* Export standard REST methods */
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};
