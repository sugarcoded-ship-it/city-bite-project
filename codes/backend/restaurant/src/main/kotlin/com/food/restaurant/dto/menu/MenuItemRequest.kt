package com.food.restaurant.dto.menu

import java.math.BigDecimal

data class MenuItemRequest(
    val name: String,
    val price: BigDecimal,
    val category: String,
    val menuPic: String? = null,
    val description: String? = null,
    val recipe: List<MenuRecipeRequest> = emptyList(),
    val optionGroups: List<OptionGroupRequest> = emptyList()
)