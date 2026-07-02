import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import keycloak from './keycloak';
import { type AppRole, hasRole, getUserRoles } from './roles';

interface ProtectedRouteProps {
    // For profiles
    allowedRoles: AppRole[];
    children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    // Check if the user has any of the allowed roles
    const isAuthorized = allowedRoles.some((role) => hasRole(role));

    if (isAuthorized) {
        return children ? <>{children}</> : <Outlet />;
    }

    const userRoles = getUserRoles();

    // no permission
    if (userRoles.length > 0) {
        return <Navigate to={"/"} replace />;
    }

    // invalid roles
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            gap: '16px',
            padding: '24px',
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '8px',
            }}>
                🚫
            </div>
            <h2 style={{
                margin: 0,
                color: '#1e293b',
                fontSize: '1.5rem',
                fontWeight: 700,
            }}>
                Access Denied
            </h2>
            <p style={{
                margin: 0,
                color: '#64748b',
                fontSize: '0.9rem',
                textAlign: 'center',
                maxWidth: '360px',
                lineHeight: 1.6,
            }}>
                Your account does not have a valid role assigned. Please contact your administrator.
            </p>
            <button
                onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
                style={{
                    marginTop: '8px',
                    padding: '10px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#dc2626')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#ef4444')}
            >
                Log Out
            </button>
        </div>
    );
};
