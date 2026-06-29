package com.food.restaurant.dto.cart

data class AddToCartRequest(
    val menuId: Int,
    val specialRequest: String?,
    val selectedChoices: Map<String, List<Int>>?,
    val quantity: Int = 1
)