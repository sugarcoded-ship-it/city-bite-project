import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import keycloak from './keycloak.ts';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
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

// Catches 401 and 403 errors coming back from Spring Boot
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Session expired or invalid token. Redirecting to Keycloak...");
            keycloak.login(); // Redirect back to the login screen
        } else if (error.response?.status === 403) {
            console.error("Access forbidden. You do not have permission.");
            alert("Your account has been deactivated or you do not have permission.");
            keycloak.logout(); 
        }
        return Promise.reject(error);
    }
);

export const apiClient = async <T>(
    endpoint: string,
    options: AxiosRequestConfig<unknown> = {}
): Promise<T> => {
    const response = await api({
        url: endpoint,
        ...options
    });
    return response.data;
};

export const apiPut = async <T>(endpoint: string, body: unknown, options = {}): Promise<T> => {
    const response = await api.put<T>(endpoint, body, options);
    return response.data;
};