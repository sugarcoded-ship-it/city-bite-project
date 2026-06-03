import React from 'react';
import keycloak from '../security/keycloak';
import CustomerHome from './CustomerHome';
import OwnerHome from './OwnerHome';
import StaffHome from './StaffHome';

const HomeDispatcher: React.FC = () => {
    // 1. Check Keycloak realm roles directly
    if (keycloak.hasRealmRole('CUSTOMER') || keycloak.hasRealmRole('ROLE_CUSTOMER')) {
        return <CustomerHome />;
    }

    if (keycloak.hasRealmRole('OWNER') || keycloak.hasRealmRole('ROLE_OWNER')) {
        return <OwnerHome />;
    }

    if (keycloak.hasRealmRole('STAFF') || keycloak.hasRealmRole('ROLE_STAFF')) {
        return <StaffHome />;
    }

    // 2. Fallback if a authenticated user somehow has none of the required business roles
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>Your account does not have a valid role assigned. Please contact administration.</p>
            <button onClick={() => keycloak.logout()}>Log Out</button>
        </div>
    );
};

export default HomeDispatcher;