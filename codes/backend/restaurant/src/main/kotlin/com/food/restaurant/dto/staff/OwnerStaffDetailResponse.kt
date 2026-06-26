package com.food.restaurant.dto.staff

import java.util.UUID

data class OwnerStaffDetailResponse (
    val id: UUID,
    val fullName: String,
    val email: String,
    val phone: String?,
    val leaveDayAmount: Int,
    val salary: Int,
    val address: String?
)