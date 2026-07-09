package com.food.restaurant.dto.staff

data class StaffProfileResponse(
    val firstName: String?,
    val lastName: String?,
    val username: String,
    val email: String,
    val phoneNumber: String?,
    val profilePic: String?
)

data class UpdateStaffProfileRequest(
    val username: String? = null,
    val email: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val phoneNumber: String? = null,
    val profilePic: String? = null
)
