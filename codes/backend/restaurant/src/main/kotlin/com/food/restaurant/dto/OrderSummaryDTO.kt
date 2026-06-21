package com.food.restaurant.dto

import java.math.BigDecimal

// REQUEST
data class CartItemRequest(
    val menuId: Int,
    val amount: Int,
    val selectedChoiceIds: List<Int> = emptyList()
)

// RESPONSES
data class CartSummaryResponse(
    val items: List<CartItemSummary>,
    val totalPrice: BigDecimal
)

data class CartItemSummary(
    val menuName: String,
    val amount: Int,
    val unitPrice: BigDecimal,
    val lineTotal: BigDecimal,
    val selectedOptions: List<OptionSummaryResponse> = emptyList()
)

data class OptionSummaryResponse(
    val choiceName: String,
    val extraPrice: BigDecimal
)