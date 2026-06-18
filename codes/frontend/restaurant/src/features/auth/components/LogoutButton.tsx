import React from 'react';
import keycloak from '../../../lib/keycloak';
import styles from './LogoutButton.module.css';
import {apiClient} from "../api/client.ts";

export const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    try {
      // Delete the user's cart rows from PostgreSQL
      await apiClient('/customer/cart/clear', {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to clear cart in backend database before logout:', err);
    } finally {
      keycloak.logout({
        redirectUri: window.location.origin // Automatically resolves to http://localhost/
      });
    }
  };

    return (
      <button onClick={handleLogout} className={styles.logoutButton}>
          Logout &amp; Reset Session
      </button>
  );
};