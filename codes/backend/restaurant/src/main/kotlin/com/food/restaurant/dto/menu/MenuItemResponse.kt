package com.food.restaurant.dto.menu

import com.food.restaurant.entity.menu.MenuItem
import java.math.BigDecimal

data class MenuItemResponse(
    val id: Int,
    val name: String,
    val price: BigDecimal,
    val category: String,
    val menuPic: String?
) {
    companion object {
        fun from(menuItem: MenuItem) = MenuItemResponse(
            id = menuItem.id,
            name = menuItem.name,
            price = menuItem.price,
            category = menuItem.category.name.displayName,
            menuPic = menuItem.menu_pic
        )
    }
}
