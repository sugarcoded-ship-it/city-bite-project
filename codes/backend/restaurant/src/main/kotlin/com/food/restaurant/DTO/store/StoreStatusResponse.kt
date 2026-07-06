package com.food.restaurant.dto.store

data class StoreStatusResponse(
    val isOpen: Boolean,
    val storeName: String,
    val storeAddress: String
)