package com.food.restaurant.dto.menu

import com.food.restaurant.entity.menu.MenuItem
import java.math.BigDecimal

data class MenuItemResponse(
    val id: Int,
    val name: String,
    val price: BigDecimal,
    val category: String,
    val menuPic: String?,
    val description: String?,
    val status: String,
    val recipe: List<MenuRecipeResponse>
) {
    companion object {
        fun from(menuItem: MenuItem, recipe: List<MenuRecipeResponse> = emptyList()) = MenuItemResponse(
            id = menuItem.id,
            name = menuItem.name,
            price = menuItem.price,
            category = menuItem.category.name.displayName,
            menuPic = menuItem.menu_pic,
            description = menuItem.description,
            status = menuItem.status.name.name,
            recipe = recipe
        )
    }
}
