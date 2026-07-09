package com.food.restaurant.dto.user.customer

data class CustomerProfileResponse(
    val firstName: String?,
    val lastName: String?,
    val username: String,
    val email: String,
    val phoneNumber: String?,
)

data class UpdateCustomerProfileRequest(
    val username: String? = null,
    val email: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val phoneNumber: String? = null,
)

data class UpdatePasswordRequest(
    val oldPassword: String,
    val newPassword: String
)