package com.food.restaurant.service.user

import com.food.restaurant.dto.profile.StaffProfileResponse
import com.food.restaurant.dto.profile.UpdateStaffProfileRequest
import com.food.restaurant.dto.profile.CustomerProfileResponse
import com.food.restaurant.dto.profile.UpdateCustomerProfileRequest
import com.food.restaurant.dto.profile.UpdatePasswordRequest
import com.food.restaurant.repository.user.StaffRepository
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
class ProfileService(
    private val userRepository: UserRepository,
    private val staffRepository: StaffRepository,
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

    fun toStaffProfileResponse(user: User): StaffProfileResponse {
        return StaffProfileResponse(
            firstName = user.firstName,
            lastName = user.lastName,
            username = user.username,
            email = user.email,
            phoneNumber = user.phoneNumber,
            profilePic = user.staff?.profilePic
        )
    }

    @Transactional
    fun updateProfile(user: User, request: UpdateStaffProfileRequest): StaffProfileResponse {
        val userResource = keycloak.realm(realm)
                                   .users()
                                   .get(user.id.toString())
        val userRep = userResource.toRepresentation()

        var hasKeycloakChanges = false
        request.username?.takeIf { it.isNotBlank() && it != user.username }?.let { 
            val realmResource = keycloak.realm(realm)
            val realmRep = realmResource.toRepresentation()
            if (realmRep.isEditUsernameAllowed != true) {
                realmRep.isEditUsernameAllowed = true
                realmResource.update(realmRep)
            }
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
        
        val staff = user.staff
        if (staff != null && request.profilePic != null) {
            staff.profilePic = request.profilePic
            staffRepository.save(staff)
        }
        
        val saved = userRepository.save(user)
        return toStaffProfileResponse(saved)
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