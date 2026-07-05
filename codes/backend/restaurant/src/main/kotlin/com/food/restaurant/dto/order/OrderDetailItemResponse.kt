package com.food.restaurant.dto.order

data class OrderDetailItemResponse(
    val menuId: Int,
    val menuName: String,
    val quantity: Int,
    val price: Double,
    val specialRequest: String?,
    val selectedChoiceIds: List<Int>,
    val isCanceled: Boolean
)
