package com.food.restaurant.controller.staff

import com.food.restaurant.service.UserSyncService
import org.springframework.security.oauth2.jwt.Jwt // CORRECT IMPORT
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/staff")
class HomeController(private val userSyncService: UserSyncService) {

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_STAFF')")
    fun staffHome(@AuthenticationPrincipal jwt: Jwt) {
        // Store userInfo to db
        userSyncService.syncFromToken(jwt)
        // TODO: return Staff dashboard
    }
}