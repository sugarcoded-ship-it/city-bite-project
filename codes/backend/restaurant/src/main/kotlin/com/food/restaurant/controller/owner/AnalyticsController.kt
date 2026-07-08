package com.food.restaurant.controller.owner

import com.food.restaurant.dto.user.owner.OwnerAnalyticsDto
import com.food.restaurant.service.AnalyticsSeedEntry
import com.food.restaurant.service.OwnerService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/owner/analytics")
class AnalyticsController(
    private val ownerService: OwnerService
) {

    @GetMapping
    fun getAnalytics(): ResponseEntity<OwnerAnalyticsDto> {
        return ResponseEntity.ok(ownerService.getAnalyticsMetrics())
    }

    @PostMapping("/seed")
    fun seedAnalytics(@RequestBody(required = false) events: List<AnalyticsSeedEntry>?): ResponseEntity<Map<String, Any>> {
        val saved = ownerService.seedAnalyticsTestData(events)
        return ResponseEntity.ok(mapOf("message" to "Analytics data reseeded", "count" to saved.size))
    }
}
