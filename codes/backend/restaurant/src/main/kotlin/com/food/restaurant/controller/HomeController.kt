package com.food.restaurant.controller

import com.food.restaurant.service.UserSyncService
import org.springframework.security.oauth2.jwt.Jwt // CORRECT IMPORT
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HomeController(private val userSyncService: UserSyncService) {

    @GetMapping("/api/customer/home")
    @PreAuthorize("isAuthenticated()")
    fun customerHome(@AuthenticationPrincipal jwt: Jwt) {
        // Store userInfo to db
        userSyncService.syncFromToken(jwt)
    }



    @GetMapping("/api/staff/home")
    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_STAFF')")
    fun staffHome(@AuthenticationPrincipal jwt: Jwt) {
        // Store userInfo to db
        userSyncService.syncFromToken(jwt)
    }

    @GetMapping("/api/owner/home")
    @PreAuthorize("hasRole('ROLE_OWNER')")
    fun ownerHome(@AuthenticationPrincipal jwt: Jwt) {
        // Store userInfo to db
        val user = userSyncService.syncFromToken(jwt)

    }

}