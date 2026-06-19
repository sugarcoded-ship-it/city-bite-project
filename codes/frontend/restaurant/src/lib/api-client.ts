import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import keycloak from './keycloak.ts';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// The Interceptor: Automatically runs before EVERY request and be the one who carry token to backend
api.interceptors.request.use(
    async (config) => {
        try {
            // Refresh if the token expires within 30s; resolves immediately otherwise.
            await keycloak.updateToken(30);
        } catch {
            // Refresh token is also expired/invalid -> re-login.
            keycloak.login();
            return Promise.reject(new Error('Session expired'));
        }
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Catches 401 errors coming back from Spring Boot
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Session expired or invalid token. Redirecting to Keycloak...");
            keycloak.login(); // Redirect back to the login screen
        }
        return Promise.reject(error);
    }
);

// Allow whatever pass into the function to decide how the request behaves
export const apiClient = async <T>(
    endpoint: string,
    options: Partial<InternalAxiosRequestConfig> = {}
): Promise<T> => {
    const response = await api({
        url: endpoint,
        ...options
    });
    return response.data;
};