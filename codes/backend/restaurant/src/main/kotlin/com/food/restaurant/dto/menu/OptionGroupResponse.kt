package com.food.restaurant.dto.menu

data class OptionGroupResponse(
    val id: Int,
    val groupName: String,
    val isRequired: Boolean,
    val maxChoices: Int,
    val choices: List<OptionChoiceResponse>
)