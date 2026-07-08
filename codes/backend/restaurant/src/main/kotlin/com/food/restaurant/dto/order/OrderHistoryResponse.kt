package com.food.restaurant.dto.order

data class OrderHistoryResponse(
    val orderId: Int,
    val totalAmount: Double,
    val creditApplied: Double,
    val createdAt: String,
    val status: String,
    val canceledBy: String?,
    val deliveryAddress: String,
    val staffName: String?,
    val items: List<OrderDetailItemResponse>
)
