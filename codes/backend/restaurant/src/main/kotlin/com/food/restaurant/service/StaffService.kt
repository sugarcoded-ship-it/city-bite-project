
package com.food.restaurant.service

import com.food.restaurant.dto.staff.OwnerStaffDetailResponse
import com.food.restaurant.dto.staff.StaffListResponse
import com.food.restaurant.dto.staff.StaffStatusUpdateRequest
import com.food.restaurant.entity.user.StaffStatus
import com.food.restaurant.repository.StaffRepository
import org.springframework.transaction.annotation.Transactional
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class StaffService(
    private val staffRepository: StaffRepository,
) {

    fun isInactive(id: UUID): Boolean {
        val staff = staffRepository.findById(id).get()
        return staff.status == StaffStatus.INACTIVE
    }

    fun getAllStaff(): List<StaffListResponse> {
        return staffRepository.findAllStaffList()
    }

    fun getStaffById(id: UUID): OwnerStaffDetailResponse {
        val staff = staffRepository.findById(id)
            .orElseThrow { NoSuchElementException("Staff not found with id: $id") }
        val user = staff.user
        return OwnerStaffDetailResponse(
            id = staff.id,
            fullName = "${user.firstName ?: ""} ${user.lastName ?: ""}".trim(),
            email = user.email,
            phone = user.phoneNumber,
            leaveDayAmount = staff.dayOffAmount,
            salary = staff.salary,
            address = staff.address
        )
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