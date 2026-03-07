import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// Define the base URL using standard Vite env variable
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL,
    // Ensure cookies (like HttpOnly HttpOnly Refresh Token or Session Cookie) 
    // are sent with every cross-origin request
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Access Token to every request
api.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        const token = authStore.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// We need a variable to store the refresh promise so that concurrent
// requests during token refresh will wait for the same refresh request.
let refreshPromise: Promise<string> | null = null;

// Response Interceptor: Handle 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const authStore = useAuthStore();

            try {
                // If there's no ongoing refresh request, start one
                if (!refreshPromise) {
                    refreshPromise = authStore.refresh();
                }

                // Wait for the new token
                const newToken = await refreshPromise;

                // Update the Authorization header on the failed request with the new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Retry the failed request with the new token
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails (e.g., refresh token expired), force logout
                authStore.logout();
                return Promise.reject(refreshError);
            } finally {
                // Clear the promise when done to allow future refresh requests
                refreshPromise = null;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
