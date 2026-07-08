package com.food.restaurant.dto.menu

data class OptionChoiceResponse(
    val choiceId: Int,
    val choiceName: String,
    val extraPrice: Double,
    val available: Boolean = true,
    val ingredients: List<OptionIngredientResponse> = emptyList()
)
