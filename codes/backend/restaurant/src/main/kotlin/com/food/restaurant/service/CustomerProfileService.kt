package com.food.restaurant.service

import com.food.restaurant.dto.user.customer.CustomerProfileResponse
import com.food.restaurant.dto.user.customer.UpdateCustomerProfileRequest
import com.food.restaurant.dto.user.customer.UpdatePasswordRequest
import com.food.restaurant.entity.user.User
import com.food.restaurant.repository.user.UserRepository
import org.keycloak.OAuth2Constants
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.keycloak.representations.idm.CredentialRepresentation
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.lang.Exception

@Service
class CustomerProfileService(
    private val userRepository: UserRepository,
    private val keycloak: Keycloak,
    @Value("\${keycloak.realm:restaurant-realm}")
    private val realm: String,
    @Value("\${keycloak.server-url:http://localhost/auth/}")
    private val serverUrl: String,
    @Value("\${keycloak.internal-url:#{null}}")
    private val internalUrl: String?
) {

    fun toResponse(user: User): CustomerProfileResponse {
        return CustomerProfileResponse(
            firstName = user.firstName,
            lastName = user.lastName,
            username = user.username,
            email = user.email,
            phoneNumber = user.phoneNumber,
        )
    }

    @Transactional
    fun updateProfile(user: User, request: UpdateCustomerProfileRequest): CustomerProfileResponse {
        val userResource = keycloak.realm(realm)
                                   .users()
                                   .get(user.id.toString())
        val userRep = userResource.toRepresentation()

        var hasKeycloakChanges = false
        request.username?.takeIf { it.isNotBlank() && it != user.username }?.let {
            userRep.username = it; user.username = it; hasKeycloakChanges = true
        }
        request.email?.takeIf { it.isNotBlank() && it != user.email }?.let { 
            userRep.email = it; user.email = it; hasKeycloakChanges = true 
        }
        request.firstName?.takeIf { it != user.firstName }?.let { 
            userRep.firstName = it; user.firstName = it; hasKeycloakChanges = true 
        }
        request.lastName?.takeIf { it != user.lastName }?.let { 
            userRep.lastName = it; user.lastName = it; hasKeycloakChanges = true 
        }

        if (hasKeycloakChanges) {
            userResource.update(userRep)
        }

        user.phoneNumber = request.phoneNumber?.trim()?.ifEmpty { null }
        
        val saved = userRepository.save(user)
        return toResponse(saved)
    }

    fun updatePassword(user: User, request: UpdatePasswordRequest) {
        val userResource = keycloak.realm(realm)
                                   .users()
                                   .get(user.id.toString())
        val userRep = userResource.toRepresentation()

        // Verify old password by attempting to get a token
        val url = internalUrl ?: serverUrl
        val testKeycloak = KeycloakBuilder.builder()
            .serverUrl(url)
            .realm(realm)
            .grantType(OAuth2Constants.PASSWORD)
            .clientId("restaurant-app")
            .username(userRep.username)
            .password(request.oldPassword)
            .build()

        try {
            testKeycloak.tokenManager().grantToken()
        } catch (e: Exception) {
            throw IllegalArgumentException("Invalid old password", e)
        }

        // Reset password
        val credential = CredentialRepresentation().apply {
            type = CredentialRepresentation.PASSWORD
            value = request.newPassword
            isTemporary = false
        }
        userResource.resetPassword(credential)
    }
}