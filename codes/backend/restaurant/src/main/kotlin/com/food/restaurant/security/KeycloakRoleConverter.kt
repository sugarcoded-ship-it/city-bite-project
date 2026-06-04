package com.food.restaurant.security

import org.springframework.core.convert.converter.Converter
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt

class KeycloakRoleConverter : Converter<Jwt, Collection<GrantedAuthority>> {
    override fun convert(jwt: Jwt): Collection<GrantedAuthority> {
        // get realAccess part which inside contain role of the user
        val realmAccess = jwt.claims["realm_access"] as? Map<*, *> ?: return emptyList()
        // get user role from realmAccess
        val roles = realmAccess["roles"] as? List<*> ?: return emptyList()

        // Map them to Spring Security authorities with the "ROLE_" prefix
        return roles.mapNotNull { role ->
            if (role is String) SimpleGrantedAuthority("ROLE_${role.uppercase()}") else null
        }
    }
}