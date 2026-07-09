package com.food.restaurant.controller.staff

import com.food.restaurant.service.user.StaffService
import com.food.restaurant.service.user.UserSyncService
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.jwt.Jwt // CORRECT IMPORT
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController("staffHomeController")
@RequestMapping("/api/staff")
class HomeController(
    private val userSyncService: UserSyncService,
    private val staffService: StaffService
) {

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_STAFF')")
    fun staffHome(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<String> { // String for placeholder
        if (staffService.isInactive(UUID.fromString(jwt.subject))) {
            return ResponseEntity.badRequest().body("You have no permission to access this anymore")
        }
        // Store userInfo to db
        userSyncService.syncFromToken(jwt)
        // TODO: return Staff dashboard
        return ResponseEntity.ok("Successfully staff has been successfully")
    }
}