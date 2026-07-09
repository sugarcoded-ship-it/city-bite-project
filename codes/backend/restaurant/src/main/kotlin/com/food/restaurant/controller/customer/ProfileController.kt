package com.food.restaurant.controller.customer

import com.food.restaurant.dto.user.customer.CustomerProfileResponse
import com.food.restaurant.dto.user.customer.UpdateCustomerProfileRequest
import com.food.restaurant.repository.user.UserRepository
import com.food.restaurant.service.ProfileService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController("customerProfileController")
@RequestMapping("/api/customer/profile")
class ProfileController(
    private val profileService: ProfileService,
    private val userRepository: UserRepository
) {

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    fun getProfile(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<CustomerProfileResponse> {
        val user = userRepository.findById(UUID.fromString(jwt.subject))
                                 .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        return ResponseEntity.ok(profileService.toResponse(user))
    }

    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    fun updateProfile(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: UpdateCustomerProfileRequest
    ): ResponseEntity<CustomerProfileResponse> {
        val user = userRepository.findById(UUID.fromString(jwt.subject))
                                 .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        val updated = profileService.updateProfile(user, request)
        return ResponseEntity.ok(updated)
    }

    @PatchMapping("/password")
    @PreAuthorize("isAuthenticated()")
    fun updatePassword(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: com.food.restaurant.dto.user.customer.UpdatePasswordRequest
    ): ResponseEntity<Void> {
        val user = userRepository.findById(UUID.fromString(jwt.subject))
                                 .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        profileService.updatePassword(user, request)
        return ResponseEntity.ok().build()
    }

}