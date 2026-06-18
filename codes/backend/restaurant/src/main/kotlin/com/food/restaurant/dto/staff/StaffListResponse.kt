package com.food.restaurant.dto.staff

import java.util.UUID

data class StaffListResponse (
    val id: UUID,
    val username: String,
    val fullName: String,
    val isActive: Boolean
)
