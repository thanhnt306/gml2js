import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api'; // Import our new Axios instance

export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    position: string;
}

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null);
    const isAuthenticated = ref<boolean>(false);

    // Access token stored in memory ONLY (Not localStorage - XSS protection)
    const accessToken = ref<string | null>(null);

    // Actions
    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            // Call the login endpoint. 
            // The backend MUST return the 'accessToken' in the JSON body 
            // AND set the 'refreshToken' in an HttpOnly cookie.
            const response = await api.post('/auth/login', { username, password });

            accessToken.value = response.data.accessToken;
            isAuthenticated.value = true;

            // Fetch user profile immediately after login
            await fetchUser();

            return true;
        } catch (error) {
            console.error('Login failed:', error);
            // Optionally clear state on failure
            accessToken.value = null;
            isAuthenticated.value = false;
            user.value = null;
            return false;
        }
    };

    const fetchUser = async (): Promise<void> => {
        try {
            // Uses the accessToken thanks to the request interceptor in api.ts
            const response = await api.get('/auth/me');
            user.value = response.data.user;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw error;
        }
    };

    const refresh = async (): Promise<string> => {
        try {
            // The backend MUST read the HttpOnly Refresh Cookie from the request
            // and return a fresh new Access Token.
            const response = await api.post('/auth/refresh');

            accessToken.value = response.data.accessToken;
            isAuthenticated.value = true;

            return accessToken.value as string;
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails (e.g., cookie expired), clear state
            logout();
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Tell backend to invalidate/clear the HttpOnly cookie
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout request failed, cleaning up local state anyway:', error);
        } finally {
            user.value = null;
            isAuthenticated.value = false;
            accessToken.value = null;
        }
    };

    const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
        try {
            // In a real app, this would be an API call
            // const response = await api.put('/auth/me', updatedData);
            // user.value = response.data.user;
            
            // For now, if we are using mocks, we just update local state
            if (user.value) {
                user.value = { ...user.value, ...updatedData };
            }
            return true;
        } catch (error) {
            console.error('Failed to update user:', error);
            return false;
        }
    };

    const register = async (userData: any): Promise<boolean> => {
        try {
            await api.post('/auth/register', userData);
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            return false;
        }
    };

    const activateLicense = async (licenseKey: string): Promise<boolean> => {
        try {
            await api.post('/auth/activate-license', { licenseKey });
            return true;
        } catch (error) {
            console.error('License activation failed:', error);
            return false;
        }
    };

    return { user, isAuthenticated, accessToken, login, logout, refresh, fetchUser, register, activateLicense, updateUser };
});
