package com.food.restaurant.dto.menu

import java.math.BigDecimal

data class MenuRecipeRequest(
    val stockId: Int,
    val amount: BigDecimal
)