package com.food.restaurant.repository.user

import com.food.restaurant.entity.user.LeaveDay
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LeaveDayRepository : JpaRepository<LeaveDay, Int> {
    fun countByStatus(status: String): Long
}