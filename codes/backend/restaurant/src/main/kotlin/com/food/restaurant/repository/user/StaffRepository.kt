package com.food.restaurant.repository.user

import com.food.restaurant.entity.user.Staff
import com.food.restaurant.entity.user.StaffStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface StaffRepository : JpaRepository<Staff, UUID> {
    fun countByStatus(status: StaffStatus): Long
}