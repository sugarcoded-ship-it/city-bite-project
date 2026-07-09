import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasRole } from '../../../lib/roles';
import keycloak from '../../../lib/keycloak';
import { CustomerDashboard } from '../CustomerDashboard/CustomerDashboard';

export const HomeDispatcher: React.FC = () => {
    if (hasRole('OWNER'))    return <Navigate to="/owner/dashboard" replace />;
    if (hasRole('STAFF'))    return <Navigate to="/staff/dashboard" replace />;
    if (hasRole('CUSTOMER')) return <CustomerDashboard />;

    // No recognized role
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>Your account does not have a valid role assigned. Please contact administration.</p>
            <button onClick={() => keycloak.logout()}>Log Out</button>
        </div>
    );
};

