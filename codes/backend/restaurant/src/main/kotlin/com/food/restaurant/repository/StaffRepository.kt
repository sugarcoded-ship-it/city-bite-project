package com.food.restaurant.repository

import com.food.restaurant.entity.user.Staff
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface StaffRepository : JpaRepository<Staff, UUID> {
    fun countByStatus(status: String): Long
}