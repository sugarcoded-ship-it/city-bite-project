package com.food.restaurant.dto.staff

import com.food.restaurant.entity.user.StaffStatus
import java.util.UUID

data class StaffListResponse (
    val id: UUID,
    val username: String,
    val fullName: String,
    val status: StaffStatus
)
