package com.food.restaurant.controller.staff

import com.food.restaurant.dto.user.customer.CustomerProfileResponse
import com.food.restaurant.dto.user.customer.UpdateCustomerProfileRequest
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

import com.food.restaurant.service.StorageService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile

@RestController("staffProfileController")
@RequestMapping("/api/staff/profile")
class ProfileController(
    private val customerProfileService: CustomerProfileService,
    private val userSyncService: UserSyncService,
    private val storageService: StorageService
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
        val updated = customerProfileService.updateProfile(user, request)
        return ResponseEntity.ok(updated)
    }

    @PostMapping("/upload-avatar")
    @PreAuthorize("hasAnyRole('STAFF', 'OWNER')")
    fun uploadAvatar(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, String>> {
        val url = storageService.uploadFile(file, "avatars")
        return ResponseEntity.ok(mapOf("url" to url))
    }
}
