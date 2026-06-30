package com.food.restaurant.dto

import java.math.BigDecimal
import java.util.UUID

data class CartItemRequest(
    val menuId: Int,
    val amount: Int,
    val specialRequest: String,
    val selectedChoiceIds: List<Int> = emptyList()
)

data class CartSummaryResponse(
    val items: List<CartItemSummary>,
    val totalPrice: BigDecimal
)

data class CartItemSummary(
    val menuId: Int,
    val menuName: String,
    val amount: Int,
    val specialRequest: String?,
    val unitPrice: BigDecimal,
    val lineTotal: BigDecimal,
    val selectedOptions: List<OptionSummaryResponse> = emptyList(),
    val selectedChoiceIds: List<Int> = emptyList()
)

data class OptionSummaryResponse(
    val choiceName: String,
    val extraPrice: BigDecimal
)

data class CreateOrderRequest(
    val customerUuid: UUID,
    val addressId: Int,
    val orderStatusId: Int,
    val paymentMethodId: Int,
    val totalPrice: BigDecimal,
    val items: List<CartItemRequest>
)
