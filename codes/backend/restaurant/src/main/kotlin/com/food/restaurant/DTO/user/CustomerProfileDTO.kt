package com.food.restaurant.dto.user

data class CustomerProfileResponse(
    val firstName: String?,
    val lastName: String?,
    val username: String,
    val email: String,
    val phoneNumber: String?,
    val profilePic: String?
)

data class UpdateCustomerProfileRequest(
    val phoneNumber: String?,
    val profilePic: String? = null
)