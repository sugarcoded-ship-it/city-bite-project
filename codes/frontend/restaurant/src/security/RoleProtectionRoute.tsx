import React from 'react';
import { Navigate } from 'react-router-dom';
import keycloak from './keycloak';

interface Props {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RoleProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
    // Check if the user has at least one of the roles defined in your Keycloak realm
    const hasRequiredRole = allowedRoles.some(role =>
        keycloak.hasRealmRole(role) || keycloak.hasRealmRole(`ROLE_${role}`)
    );

    if (!hasRequiredRole) {
        // Redirect to home page if they don't have permission (e.g. Student trying to access Tutor page)
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};