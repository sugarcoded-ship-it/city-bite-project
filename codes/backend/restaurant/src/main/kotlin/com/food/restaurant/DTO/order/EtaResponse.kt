package com.food.restaurant.dto.order

data class EtaResponse(
    val orderId: Int,
    val available: Boolean,
    val message: String? = null,
    val prepMinutes: Int = 0,
    val travelMinutes: Int = 0,
    val etaFrom: String? = null,
    val etaTo: String? = null,
    val status: String? = null
)