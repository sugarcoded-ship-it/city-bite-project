package com.food.restaurant.dto

data class AddressRequest(
    val addressInfo: String?,
    val subDistrict: String,
    val district: String,
    val province: String,
    val postalCode: String
)

data class AddressResponse(
    val id: Int,
    val addressInfo: String?,
    val subDistrict: String,
    val district: String,
    val province: String,
    val postalCode: String
)
