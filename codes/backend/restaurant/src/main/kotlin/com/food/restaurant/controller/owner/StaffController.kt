package com.food.restaurant.controller.owner

import com.food.restaurant.dto.staff.StaffListResponse
import com.food.restaurant.service.StaffService
import com.food.restaurant.service.UserService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/owner")
class StaffController (
    private val staffService: StaffService,
    private val userService: UserService
) {

    @GetMapping("/staff")
    @PreAuthorize("hasRole('ROLE_OWNER')")
    fun getEmployeeList(): List<StaffListResponse> {
        // TODO: Return Staff detail for further detail
        return staffService.getAllStaffForOwner()
    }
}