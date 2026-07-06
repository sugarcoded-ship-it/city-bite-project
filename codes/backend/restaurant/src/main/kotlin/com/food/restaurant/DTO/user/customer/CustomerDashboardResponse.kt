package com.food.restaurant.dto.user.customer

import com.food.restaurant.dto.menu.MenuItemResponse

data class CustomerDashboardResponse (
    val menuItems: List<MenuItemResponse>,
    val status: String,
    val storeName: String
)