package com.food.restaurant.dto.menu

import java.math.BigDecimal

data class OptionChoiceRequest(
    val choiceName: String,
    val extraPrice: BigDecimal = BigDecimal.ZERO,
    val ingredients: List<OptionIngredientRequest> = emptyList()
)
