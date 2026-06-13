import React from 'react';
import keycloak from '../security/keycloak';
import styles from './LogoutButton.module.css';

export const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    keycloak.logout({ 
      redirectUri: window.location.origin // Automatically resolves to http://localhost/
    });
  };

    return (
      <button onClick={handleLogout} className={styles.logoutButton}>
          Logout &amp; Reset Session
      </button>
  );
};