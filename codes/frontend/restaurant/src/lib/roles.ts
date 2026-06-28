import keycloak from './keycloak';

export type AppRole = 'OWNER' | 'STAFF' | 'CUSTOMER';

export function hasRole(role: AppRole): boolean {
    return keycloak.hasRealmRole(role) || keycloak.hasRealmRole(`ROLE_${role}`);
}

export function getUserRoles(): AppRole[] {
    const allRoles: AppRole[] = ['OWNER', 'STAFF', 'CUSTOMER'];
    return allRoles.filter((role) => hasRole(role));
}

