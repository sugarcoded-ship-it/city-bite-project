import axios from 'axios';
import keycloak from '../security/keycloak.ts';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// The Interceptor: Automatically runs before EVERY request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request configuration errors here
        return Promise.reject(error);
});

// Catches 401 errors coming back from Spring Boot
api.interceptors.response.use(
    (response) => {
        return response; //Success
    },
    (error) => {
        // Check if the server returned a 401 Unauthorized status code
        if (error.response && error.response.status === 401) {
            console.error("Session expired or invalid token. Redirecting to Keycloak...");
            // Clean up the local storage
            localStorage.removeItem('access_token');
            // Redirect back to the login screen
            keycloak.login();
        }

        return Promise.reject(error);
    }
);

export const apiClient = async <T>(endpoint: string, options = {}): Promise<T> => {
    const response = await api.get<T>(endpoint, options);
    return response.data;
};