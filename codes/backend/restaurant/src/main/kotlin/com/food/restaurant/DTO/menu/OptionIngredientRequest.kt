package com.food.restaurant.dto.menu

import java.math.BigDecimal

data class OptionIngredientRequest(
    val stockId: Int,
    val amount: BigDecimal
)
