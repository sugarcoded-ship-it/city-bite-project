package com.food.restaurant.dto.cart

data class CartItemResponse(
    val menuId: Int,
    val name: String,
    val price: Double,
    val quantity: Int,
    val specialRequest: String?,
    val selectedCustomizations: List<String>
)