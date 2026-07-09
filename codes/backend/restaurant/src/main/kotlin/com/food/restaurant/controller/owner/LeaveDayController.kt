package com.food.restaurant.controller.owner
import com.food.restaurant.dto.leaveday.OwnerLeaveDayListResponse
import com.food.restaurant.dto.leaveday.LeaveDayResponse

import com.food.restaurant.service.leaveday.LeaveDayService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController("ownerLeaveDayController")
@RequestMapping("/api/owner/leave-days")
class LeaveDayController(
    private val leaveDayService: LeaveDayService
) {

    @GetMapping
    fun getAllLeaveDays(
        @RequestParam(defaultValue = "") search: String
    ): ResponseEntity<OwnerLeaveDayListResponse> {
        val response = leaveDayService.searchOwnerLeaveDays(search)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{id}/status")
    fun updateLeaveDayStatus(
        @PathVariable id: Int,
        @RequestParam status: String
    ): ResponseEntity<LeaveDayResponse> {
        val response = leaveDayService.updateLeaveDayStatus(id, status)
        return ResponseEntity.ok(response)
    }
}
