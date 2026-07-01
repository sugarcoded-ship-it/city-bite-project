package com.food.restaurant.repository.user

import com.food.restaurant.dto.staff.StaffListResponse
import com.food.restaurant.entity.user.Staff
import com.food.restaurant.entity.user.StaffStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface StaffRepository : JpaRepository<Staff, UUID> {

    @Query("""
        SELECT new com.food.restaurant.dto.staff.StaffListResponse(
            s.id,
            u.username,
            concat(u.firstName, ' ', u.lastName),
            s.status
        )
        FROM Staff s
        JOIN s.user u
        ORDER BY CASE WHEN s.status = 'ACTIVE' THEN 1 ELSE 2 END ASC
    """)
    fun findAllStaffList(): List<StaffListResponse>

    fun countByStatus(status: StaffStatus): Long
}