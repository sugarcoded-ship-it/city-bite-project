package com.food.restaurant.dto

import java.math.BigDecimal

data class RefundCreditResponse(
    val currentBalance: BigDecimal
)

data class CreditHistoryEntryResponse(
    val type: String,
    val amount: BigDecimal,
    val orderId: Int?,
    val description: String?,
    val createdAt: String
)