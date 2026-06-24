package com.food.restaurant.dto.stock

import java.math.BigDecimal

data class CreateStockItem(
    val name: String,
    val description: String?,
    val amount: BigDecimal,
    val measureUnit: String,
    val categoryId: Int,
)