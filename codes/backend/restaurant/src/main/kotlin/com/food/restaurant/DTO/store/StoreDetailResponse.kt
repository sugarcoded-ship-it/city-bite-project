package com.food.restaurant.dto.store

import java.time.LocalTime

data class StoreDetailResponse(
    val storeName: String,
    val storeAddress: String,
    val logoUrl: String,
    val phone: String,
    val openTime: LocalTime,
    val closeTime: LocalTime,
    val isOpen: Boolean
)