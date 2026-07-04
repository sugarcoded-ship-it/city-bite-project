package com.food.restaurant.service

import com.food.restaurant.dto.staff.OwnerStaffDetailResponse
import com.food.restaurant.dto.staff.StaffListResponse
import com.food.restaurant.dto.staff.StaffStatusUpdateRequest
import com.food.restaurant.dto.staff.CreateStaffRequest
import com.food.restaurant.entity.user.StaffStatus
import com.food.restaurant.entity.user.Staff
import com.food.restaurant.entity.user.User
import com.food.restaurant.repository.user.UserRepository
import com.food.restaurant.repository.user.StaffRepository
import java.util.UUID
import jakarta.ws.rs.core.Response
import org.keycloak.admin.client.Keycloak
import org.keycloak.representations.idm.CredentialRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.springframework.beans.factory.annotation.Value
import org.springframework.transaction.annotation.Transactional
import org.springframework.stereotype.Service

@Service
class StaffService(
    private val staffRepository: StaffRepository,
    private val userRepository: UserRepository,
    private val keycloak: Keycloak,
    @Value("\${keycloak.realm:restaurant-realm}")
    private val realm: String
) {

    fun isInactive(id: UUID): Boolean {
        val staff = staffRepository.findById(id).orElse(null)
            ?: return false
        return staff.status == StaffStatus.INACTIVE
    }

    fun getAllStaff(): List<StaffListResponse> {
        return staffRepository.findAllStaffList()
    }

    fun getStaffById(id: UUID): OwnerStaffDetailResponse {
        val staff = staffRepository.findById(id)
            .orElseThrow { NoSuchElementException("Staff not found with id: $id") }
        val user = staff.user
        return OwnerStaffDetailResponse(
            id = staff.id,
            fullName = "${user.firstName ?: ""} ${user.lastName ?: ""}".trim(),
            email = user.email,
            phone = user.phoneNumber,
            leaveDayAmount = staff.dayOffAmount,
            salary = staff.salary,
            address = staff.address
        )
    }

    @Transactional
    fun updateStaffStatuses(updates: List<StaffStatusUpdateRequest>) {
        val ids = updates.map { it.id }
        val staffs = staffRepository.findAllById(ids)
        val updateMap = updates.associateBy { it.id }

        staffs.forEach { staff ->
            val update = updateMap[staff.id]
            if (update != null) {
                staff.status = update.status
            }
        }
        staffRepository.saveAll(staffs)
    }

    @Transactional
    fun createStaff(request: CreateStaffRequest): StaffListResponse {
        // Preparing data for keycloak
        val userRepresentation = UserRepresentation().apply {
            username = request.username
            email = request.email
            firstName = request.firstName
            lastName = request.lastName
            isEnabled = true
        }

        val response: Response = keycloak.realm(realm).users().create(userRepresentation)

        if (response.status != 201) {
            throw RuntimeException("Failed to create user in Keycloak. Status: ${response.status}")
        }

        // Extract UUID from url path
        val location = response.location?.path
        val userIdString = location?.substringAfterLast("/")
            ?: throw RuntimeException("Could not extract user ID from Keycloak response")
        val keycloakUuid = UUID.fromString(userIdString)

        try {
            // Temporary password
            val credential = CredentialRepresentation().apply {
                type = CredentialRepresentation.PASSWORD
                value = request.password
                isTemporary = true
            }

            keycloak
                .realm(realm)
                .users()
                .get(userIdString)
                .resetPassword(credential)

            // Assign staff role
            val realmRole = keycloak.realm(realm).roles().get("STAFF").toRepresentation()
            keycloak
                .realm(realm)
                .users()
                .get(userIdString)
                .roles()
                .realmLevel()
                .add(listOf(realmRole))

            val user = User(
                id = keycloakUuid,
                username = request.username,
                email = request.email,
                firstName = request.firstName,
                lastName = request.lastName,
                phoneNumber = request.phone
            )

            val staff = Staff(
                id = keycloakUuid,
                user = user,
                salary = request.salary,
                dayOffAmount = request.dayOffAmount,
                address = request.address,
                status = StaffStatus.ACTIVE
            )
            user.staff = staff

            userRepository.save(user)
            staffRepository.save(staff)

            return StaffListResponse(
                id = staff.id,
                username = user.username,
                fullName = "${user.firstName ?: ""} ${user.lastName ?: ""}".trim(),
                status = staff.status
            )
        } catch (e: Exception) {
            keycloak.realm(realm).users().get(userIdString).remove()
            throw RuntimeException("Failed to save staff to database, rolled back Keycloak creation.", e)
        }
    }
}