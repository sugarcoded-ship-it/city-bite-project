package com.food.restaurant.service

import com.food.restaurant.entity.User
import com.food.restaurant.repository.UserRepository
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class UserSyncService(private val users: UserRepository) {

    @Transactional
    fun syncFromToken(jwt: Jwt): User {
        val idString = jwt.subject
        val id = UUID.fromString(idString)
        val username  = jwt.getClaimAsString("preferred_username") ?: idString
        val email     = jwt.getClaimAsString("email")
            ?: error("No email claim in token")
        val firstName = jwt.getClaimAsString("given_name")
        val lastName  = jwt.getClaimAsString("family_name")

        val existing = users.findById(id).orElse(null)
            ?: return users.save(
                User(id = id, username = username, email = email,
                    firstName = firstName, lastName = lastName)
            )

        // refresh only the Keycloak-owned fields; never touch phone/address
        var changed = false
        if (existing.username  != username)  { existing.username  = username;  changed = true }
        if (existing.email     != email)     { existing.email     = email;     changed = true }
        if (existing.firstName != firstName) { existing.firstName = firstName; changed = true }
        if (existing.lastName  != lastName)  { existing.lastName  = lastName;  changed = true }
        if (changed) users.save(existing)
        return existing
    }
}