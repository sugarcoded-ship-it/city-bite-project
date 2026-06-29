package com.food.restaurant.dto.menu

import com.food.restaurant.entity.stock.MeasurementUnits
import com.food.restaurant.entity.menu.MenuRecipe
import java.math.BigDecimal

data class MenuRecipeResponse(
    val stockId: Int,
    val stockName: String,
    val amount: BigDecimal,
    val measureUnit: MeasurementUnits
) {
    companion object {
        fun from(menuRecipe: MenuRecipe) = MenuRecipeResponse(
            stockId = menuRecipe.stock.id,
            stockName = menuRecipe.stock.name,
            amount = menuRecipe.amount,
            measureUnit = menuRecipe.measureUnit
        )
    }
}