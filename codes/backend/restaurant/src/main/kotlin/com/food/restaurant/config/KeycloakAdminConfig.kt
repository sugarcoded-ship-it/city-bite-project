package com.food.restaurant.config

import org.keycloak.OAuth2Constants
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class KeycloakAdminConfig(
    @Value("\${keycloak.server-url:http://localhost/auth/}")
    private val serverUrl: String,
    @Value("\${keycloak.admin-user}")
    private val adminUser: String,
    @Value("\${keycloak.admin-password}")
    private val adminPassword: String,
    @Value("\${keycloak.internal-url:#{null}}")
    private val internalUrl: String?
) {

    @Bean
    fun keycloak(): Keycloak {
        val url = internalUrl ?: serverUrl
        
        return KeycloakBuilder.builder()
            .serverUrl(url)
            .realm("master")
            .grantType(OAuth2Constants.PASSWORD)
            .clientId("admin-cli")
            .username(adminUser)
            .password(adminPassword)
            .build()
    }
}
