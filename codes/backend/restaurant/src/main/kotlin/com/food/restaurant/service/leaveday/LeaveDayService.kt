package com.food.restaurant.service.leaveday

import com.food.restaurant.dto.leaveday.LeaveDayRequest
import com.food.restaurant.dto.leaveday.LeaveDayResponse
import com.food.restaurant.dto.leaveday.OwnerLeaveDayListResponse
import com.food.restaurant.entity.leaveday.LeaveDay
import com.food.restaurant.repository.leaveday.LeaveDayRepository
import com.food.restaurant.repository.user.StaffRepository
import com.food.restaurant.repository.user.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class LeaveDayService(
    private val leaveDayRepository: LeaveDayRepository,
    private val staffRepository: StaffRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun submitLeaveDayRequest(staffUuid: UUID, request: LeaveDayRequest): LeaveDayResponse {
        val user = userRepository.findById(staffUuid).orElseThrow { IllegalArgumentException("User not found") }
        val staff = staffRepository.findById(staffUuid).orElseThrow { IllegalArgumentException("Staff not found") }

        if (staff.dayOffAmount <= 0) {
            throw IllegalArgumentException("No day-off amount left")
        }

        val duration = ChronoUnit.DAYS.between(request.startDate, request.endDate) + 1
        if (duration <= 0) {
            throw IllegalArgumentException("End date must be on or after start date")
        }
        if (duration > staff.dayOffAmount) {
            throw IllegalArgumentException("Requested duration exceeds available day-off amount")
        }

        val leaveDay = LeaveDay(
            staff = user,
            startDate = request.startDate,
            endDate = request.endDate,
            date = Timestamp(System.currentTimeMillis()),
            status = "PENDING"
        )

        val saved = leaveDayRepository.save(leaveDay)
        return mapToResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getStaffLeaveDays(staffUuid: UUID): List<LeaveDayResponse> {
        return leaveDayRepository.findByStaffIdOrderByDateDesc(staffUuid)
            .map { mapToResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getAllLeaveDays(): List<LeaveDayResponse> {
        return leaveDayRepository.findAllByOrderByDateDesc()
            .map { mapToResponse(it) }
    }

    @Transactional(readOnly = true)
    fun searchOwnerLeaveDays(search: String, limit: Int = 100): OwnerLeaveDayListResponse {
        val pageRequest = PageRequest.of(0, limit)

        if (search.isBlank()) {
            val pending = leaveDayRepository.findAllPendingRequests()
                .map { mapToResponse(it) }
            val reviewed = leaveDayRepository.findAllReviewedRequests(pageRequest)
                .content.map { mapToResponse(it) }
            return OwnerLeaveDayListResponse(pending, reviewed)
        }

        val users = userRepository.findByUsernameContainingIgnoreCase(search)
        if (users.isEmpty()) {
            return OwnerLeaveDayListResponse(emptyList(), emptyList())
        }

        val staffIds = users.map { it.id }
        val pending = leaveDayRepository.searchPendingRequestsByStaffIds(staffIds)
            .map { mapToResponse(it) }
        val reviewed = leaveDayRepository.searchReviewedRequestsByStaffIds(staffIds, pageRequest)
            .content
            .map { mapToResponse(it) }

        return OwnerLeaveDayListResponse(
            pending = pending,
            reviewed = reviewed
        )
    }

    @Transactional(readOnly = true)
    fun getRemainingDayOffAmount(staffUuid: UUID): Int {
        val staff = staffRepository.findById(staffUuid)
            .orElseThrow { IllegalArgumentException("Staff not found") }
        return staff.dayOffAmount
    }

    @Transactional
    fun updateLeaveDayStatus(id: Int, status: String): LeaveDayResponse {
        val leaveDay = leaveDayRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Leave day not found") }

        if (leaveDay.status == "PENDING" && status == "APPROVED") {
            val duration = ChronoUnit.DAYS.between(leaveDay.startDate, leaveDay.endDate) + 1
            val staff = staffRepository.findById(leaveDay.staff.id)
                .orElseThrow { IllegalArgumentException("Staff not found") }
            if (staff.dayOffAmount >= duration) {
                staff.dayOffAmount -= duration.toInt()
                staffRepository.save(staff)
            } else {
                throw IllegalArgumentException("Staff does not have enough day-off amount")
            }
        }

        leaveDay.status = status
        val saved = leaveDayRepository.save(leaveDay)
        return mapToResponse(saved)
    }

    @Transactional
    fun cancelLeaveDay(id: Int, staffUuid: UUID) {
        val leaveDay = leaveDayRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Leave day not found") }
        if (leaveDay.staff.id != staffUuid) {
            throw IllegalArgumentException("Not authorized to cancel this request")
        }
        if (leaveDay.status != "PENDING") {
            throw IllegalArgumentException("Can only cancel PENDING requests")
        }
        leaveDayRepository.delete(leaveDay)
    }

    private fun mapToResponse(leaveDay: LeaveDay): LeaveDayResponse {
        return LeaveDayResponse(
            id = leaveDay.id,
            staffUuid = leaveDay.staff.id,
            username = leaveDay.staff.username,
            staffName = "${leaveDay.staff.firstName ?: ""} ${leaveDay.staff.lastName ?: ""}".trim(),
            startDate = leaveDay.startDate,
            endDate = leaveDay.endDate,
            status = leaveDay.status,
            date = leaveDay.date
        )
    }
}