package com.food.restaurant.controller.owner

import com.food.restaurant.dto.user.owner.OwnerDashboardDto
import com.food.restaurant.service.UserSyncService
import com.food.restaurant.service.OwnerService
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController("ownerHomeController")
@RequestMapping("/api/owner")
class HomeController(
    private val userSyncService: UserSyncService,
    private val ownerService: OwnerService,
) {

    @GetMapping("/")
    @PreAuthorize("hasRole('ROLE_OWNER')")
    fun ownerHome(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<OwnerDashboardDto> {
        userSyncService.syncFromToken(jwt)
        val ownerUuid = UUID.fromString(jwt.subject)
        val dashboardMetrics = ownerService.getDashboardMetrics(ownerUuid)

        return ResponseEntity.ok(dashboardMetrics)
    }
}