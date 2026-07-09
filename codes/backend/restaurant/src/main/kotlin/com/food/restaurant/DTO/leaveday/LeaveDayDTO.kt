package com.food.restaurant.dto.leaveday

import java.time.LocalDate
import java.util.UUID
import java.sql.Timestamp

data class LeaveDayRequest(
    val startDate: LocalDate,
    val endDate: LocalDate
)

data class LeaveDayResponse(
    val id: Int,
    val staffUuid: UUID,
    val username: String,
    val staffName: String,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val status: String,
    val date: Timestamp
)

data class OwnerLeaveDayListResponse(
    val pending: List<LeaveDayResponse>,
    val reviewed: List<LeaveDayResponse>
)
