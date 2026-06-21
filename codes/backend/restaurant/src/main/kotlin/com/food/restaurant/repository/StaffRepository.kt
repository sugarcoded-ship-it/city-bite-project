package com.food.restaurant.repository

import com.food.restaurant.dto.staff.StaffListResponse
import com.food.restaurant.entity.user.Staff
import com.food.restaurant.entity.user.StaffStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface StaffRepository : JpaRepository<Staff, UUID> {
    fun countByStatus(status: StaffStatus): Long
    fun countByStatus(status: String): Long
    @Query("""
        SELECT new com.food.restaurant.dto.staff.OwnerStaffListResponse(
            s.id,
            u.username,
            concat(u.firstName, ' ', u.lastName), 
            CASE WHEN s.status = 'ACTIVATED' THEN true ELSE false END
        )
        FROM Staff s
        JOIN s.user u
    """)
    fun findAllStaffList(): List<StaffListResponse>
}