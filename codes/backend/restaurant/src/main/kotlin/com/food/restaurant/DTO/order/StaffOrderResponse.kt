package com.food.restaurant.dto.order

data class StaffOrderResponse(
    val orderId: Int,
    val status: String,
    val customerName: String,
    val totalPrice: Double,
    val createdAt: String,
    val assignedStaffName: String?,
    val assignedStaffUuid: String?,
    val deliveryAddress: String,
    val items: List<StaffOrderItemResponse>
)

data class StaffOrderItemResponse(
    val detailId: Int,
    val menuName: String,
    val quantity: Int,
    val price: Double,
    val specialRequest: String?,
    val selectedOptions: List<String>,
    val isCanceled: Boolean
)
