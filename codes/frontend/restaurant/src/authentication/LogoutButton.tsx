import React from 'react';
import keycloak from '../security/keycloak';

export const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    // 1. Clean up your local storage tracking token
    localStorage.removeItem('access_token');

    // 2. Tell Keycloak to nuke the session cookies and send the user back to the home page
    keycloak.logout({ 
      redirectUri: window.location.origin // Automatically resolves to http://localhost/
    });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '10px 20px',
        background: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      Logout & Reset Session
    </button>
  );
};