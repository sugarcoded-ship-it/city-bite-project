package com.food.restaurant.controller.owner

import org.springframework.web.bind.annotation.PostMapping
import com.food.restaurant.dto.staff.OwnerStaffDetailResponse
import com.food.restaurant.dto.staff.StaffListResponse
import com.food.restaurant.dto.staff.CreateStaffRequest
import com.food.restaurant.service.StaffService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import com.food.restaurant.dto.staff.StaffStatusUpdateRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.UUID


@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('ROLE_OWNER')")
class StaffController (
    private val staffService: StaffService,
) {

    @GetMapping("/staff")
    fun getEmployeeList(): ResponseEntity<List<StaffListResponse>> {
        return ResponseEntity.ok(staffService.getAllStaff())
    }

    @PostMapping("/staff")
    fun createStaff(@RequestBody request: CreateStaffRequest): ResponseEntity<StaffListResponse> {
        val newStaff = staffService.createStaff(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(newStaff)
    }

    @GetMapping("/staff/{id}")
    fun getStaffDetail(@PathVariable id: UUID): ResponseEntity<OwnerStaffDetailResponse> {
        return ResponseEntity.ok(staffService.getStaffById(id))
    }

    @PutMapping("/staff-update-status")
    fun updateEmployeeStatus(@RequestBody updates: List<StaffStatusUpdateRequest>): ResponseEntity<List<StaffListResponse>> {
        staffService.updateStaffStatuses(updates)
        return ResponseEntity.ok(staffService.getAllStaff())
    }
}