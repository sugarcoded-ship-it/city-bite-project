package com.food.restaurant.repository.user

import com.food.restaurant.entity.user.LeaveDay
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface LeaveDayRepository : JpaRepository<LeaveDay, Int> {
    fun countByStatus(status: String): Long
    fun findByStaffIdOrderByDateDesc(staffId: UUID): List<LeaveDay>
    fun findAllByOrderByDateDesc(): List<LeaveDay>

    @Query("SELECT l FROM LeaveDay l WHERE l.status = 'PENDING' AND l.staff.id IN :staffIds ORDER BY l.date DESC")
    fun searchPendingRequestsByStaffIds(@Param("staffIds") staffIds: List<UUID>): List<LeaveDay>

    @Query("SELECT l FROM LeaveDay l WHERE l.status != 'PENDING' AND l.staff.id IN :staffIds ORDER BY l.date DESC")
    fun searchReviewedRequestsByStaffIds(@Param("staffIds") staffIds: List<UUID>, pageable: Pageable): Page<LeaveDay>

    @Query("SELECT l FROM LeaveDay l WHERE l.status = 'PENDING' ORDER BY l.date DESC")
    fun findAllPendingRequests(): List<LeaveDay>

    @Query("SELECT l FROM LeaveDay l WHERE l.status != 'PENDING' ORDER BY l.date DESC")
    fun findAllReviewedRequests(pageable: Pageable): Page<LeaveDay>
}