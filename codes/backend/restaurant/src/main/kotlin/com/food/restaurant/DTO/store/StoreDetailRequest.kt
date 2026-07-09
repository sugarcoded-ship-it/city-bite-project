package com.food.restaurant.dto.store

import java.time.LocalTime

data class StoreDetailRequest (
    val storeName: String,
    val storeAddress: String,
    val phone: String,
    val openTime: LocalTime,
    val closeTime: LocalTime,
)