package com.food.restaurant.dto.staff

data class CreateStaffRequest(
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val password: String,       // Temporary password
    val salary: Int,
    val dayOffAmount: Int = 100,
    val address: String? = null,
    val phone: String? = null
)