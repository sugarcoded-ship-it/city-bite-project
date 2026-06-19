import React from 'react';
import keycloak from '../security/keycloak';
import { CustomerHome } from './Customer/CustomerHome.tsx';
import { OwnerHome } from './Owner/OwnerHome.tsx';
import { StaffHome } from './StaffHome.tsx';

const HomeDispatcher: React.FC = () => {
    // Check Keycloak realm roles directly
    if (keycloak.hasRealmRole('OWNER') || keycloak.hasRealmRole('ROLE_OWNER')) {
        return <OwnerHome />;
    }

    if (keycloak.hasRealmRole('STAFF') || keycloak.hasRealmRole('ROLE_STAFF')) {
        return <StaffHome />;
    }

    if (keycloak.hasRealmRole('CUSTOMER') || keycloak.hasRealmRole('ROLE_CUSTOMER')) {
        return <CustomerHome />;
    }

    // Fallback if authenticated user somehow has none of the required roles
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>Your account does not have a valid role assigned. Please contact administration.</p>
            <button onClick={() => keycloak.logout()}>Log Out</button>
        </div>
    );
};

export default HomeDispatcher;