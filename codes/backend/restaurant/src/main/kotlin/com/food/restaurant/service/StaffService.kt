
package com.food.restaurant.service

import com.food.restaurant.dto.staff.StaffListResponse
import com.food.restaurant.dto.staff.StaffStatusUpdateRequest
import com.food.restaurant.repository.StaffRepository
import com.food.restaurant.repository.UserRepository
import org.springframework.transaction.annotation.Transactional
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class StaffService(
    private val staffRepository: StaffRepository,
) {

    fun getAllStaff(): List<StaffListResponse> {
        return staffRepository.findAllStaffList()
    }

    @Transactional
    fun updateStaffStatuses(updates: List<StaffStatusUpdateRequest>) {
        val ids = updates.map { it.id }
        val staffs = staffRepository.findAllById(ids)
        val updateMap = updates.associateBy { it.id }

        staffs.forEach { staff ->
            val update = updateMap[staff.id]
            if (update != null) {
                staff.status = update.status
            }
        }
        staffRepository.saveAll(staffs)
    }
}