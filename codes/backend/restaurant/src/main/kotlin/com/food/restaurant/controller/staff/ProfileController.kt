package com.food.restaurant.controller.staff

import com.food.restaurant.dto.user.CustomerProfileResponse
import com.food.restaurant.dto.user.UpdateCustomerProfileRequest
import com.food.restaurant.service.CustomerProfileService
import com.food.restaurant.service.UserSyncService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController("staffProfileController")
@RequestMapping("/api/staff/profile")
class ProfileController(
    private val customerProfileService: CustomerProfileService,
    private val userSyncService: UserSyncService
) {

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'OWNER')")
    fun getProfile(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<CustomerProfileResponse> {
        val user = userSyncService.syncFromToken(jwt)
        return ResponseEntity.ok(customerProfileService.toResponse(user))
    }

    @PatchMapping
    @PreAuthorize("hasAnyRole('STAFF', 'OWNER')")
    fun updateProfile(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: UpdateCustomerProfileRequest
    ): ResponseEntity<CustomerProfileResponse> {
        val user = userSyncService.syncFromToken(jwt)
        val updated = customerProfileService.updatePhoneNumber(user, request.phoneNumber)
        return ResponseEntity.ok(updated)
    }
}