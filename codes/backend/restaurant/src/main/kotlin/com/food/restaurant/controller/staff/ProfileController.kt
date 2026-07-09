
package com.food.restaurant.controller.staff

import com.food.restaurant.dto.staff.StaffProfileResponse
import com.food.restaurant.dto.staff.UpdateStaffProfileRequest
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

import com.food.restaurant.service.StorageService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController("staffProfileController")
@RequestMapping("/api/staff/profile")
class ProfileController(
    private val profileService: ProfileService,
    private val userRepository: UserRepository,
    private val storageService: StorageService
) {

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'OWNER')")
    fun getProfile(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<StaffProfileResponse> {
        val user = userRepository.findById(UUID.fromString(jwt.subject))
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        return ResponseEntity.ok(profileService.toStaffProfileResponse(user))
    }

    @PatchMapping
    @PreAuthorize("hasAnyRole('STAFF', 'OWNER')")
    fun updateProfile(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: UpdateStaffProfileRequest
    ): ResponseEntity<StaffProfileResponse> {
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

    @PostMapping("/upload-avatar")
    @PreAuthorize("hasAnyRole('STAFF', 'OWNER')")
    fun uploadAvatar(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, String>> {
        val url = storageService.uploadFile(file, "avatars")
        return ResponseEntity.ok(mapOf("url" to url))
    }
}