package com.food.restaurant.controller.staff

import com.food.restaurant.dto.staff.LeaveDayRequest
import com.food.restaurant.dto.staff.LeaveDayResponse
import com.food.restaurant.service.LeaveDayService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController("staffLeaveDayController")
@RequestMapping("/api/staff/leave-days")
class LeaveDayController(
    private val leaveDayService: LeaveDayService
) {

    @PostMapping
    fun submitLeaveDayRequest(
        authentication: Authentication,
        @RequestBody request: LeaveDayRequest
    ): ResponseEntity<LeaveDayResponse> {
        val staffUuid = UUID.fromString(authentication.name)
        val response = leaveDayService.submitLeaveDayRequest(staffUuid, request)
        return ResponseEntity.ok(response)
    }

    @GetMapping
    fun getMyLeaveDays(authentication: Authentication): ResponseEntity<List<LeaveDayResponse>> {
        val staffUuid = UUID.fromString(authentication.name)
        val response = leaveDayService.getStaffLeaveDays(staffUuid)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/amount")
    fun getRemainingDayOffAmount(authentication: Authentication): ResponseEntity<Map<String, Int>> {
        val staffUuid = UUID.fromString(authentication.name)
        val amount = leaveDayService.getRemainingDayOffAmount(staffUuid)
        return ResponseEntity.ok(mapOf("amount" to amount))
    }

    @DeleteMapping("/{id}")
    fun cancelLeaveDay(
        authentication: Authentication,
        @PathVariable id: Int
    ): ResponseEntity<Void> {
        val staffUuid = UUID.fromString(authentication.name)
        leaveDayService.cancelLeaveDay(id, staffUuid)
        return ResponseEntity.noContent().build()
    }
}
