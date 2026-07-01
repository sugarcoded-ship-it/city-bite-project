import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css'
import keycloak from './lib/keycloak.ts';

keycloak.onTokenExpired = () => {
    console.log('Token expired. Attempting to refresh...');
    // Refresh token if it expires in the next 30 seconds.
    keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
            console.log('Token successfully refreshed');
            // keycloak silently hold token in memory
        }
    }).catch(() => {
        console.error('Session completely expired. Redirecting to login...');
        // Force redirect to log in
        keycloak.login();
    });
};

keycloak.init({
    onLoad: 'login-required', // Forces browser redirect to Keycloak before React mounts
    checkLoginIframe: false,
    pkceMethod: 'S256' // Prevent Interception attack when the provider (Google, facebook, etc.) sent an authorization code back to the app via a redirect url
}).then((authenticated) => {
    if (authenticated) {
        // Store token for your backend API calls
        // localStorage.setItem('access_token', keycloak.token ?? '');

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </React.StrictMode>
        );
    }
}).catch((err) => console.error("Keycloak boot failed", err));