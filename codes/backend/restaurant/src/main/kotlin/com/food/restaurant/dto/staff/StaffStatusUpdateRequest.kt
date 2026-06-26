package com.food.restaurant.dto.staff

import com.food.restaurant.entity.user.StaffStatus
import java.util.UUID

data class StaffStatusUpdateRequest(
    val id: UUID,
    val status: StaffStatus
)
