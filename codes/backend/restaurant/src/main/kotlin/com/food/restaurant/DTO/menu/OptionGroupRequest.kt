package com.food.restaurant.dto.menu

data class OptionGroupRequest(
    val groupName: String,
    val isRequired: Boolean = false,
    val maxChoices: Int = 1,
    val choices: List<OptionChoiceRequest> = emptyList()
)
