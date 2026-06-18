package com.food.restaurant.service

import com.food.restaurant.dto.staff.StaffListResponse
import com.food.restaurant.repository.StaffRepository
import org.springframework.stereotype.Service

@Service
class StaffService(
    private val staffRepository: StaffRepository,
    ) {

    fun getAllStaffForOwner(): List<StaffListResponse> {
        return staffRepository.findAllStaffList()
    }
}