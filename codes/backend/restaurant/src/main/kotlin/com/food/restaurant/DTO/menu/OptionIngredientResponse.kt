package com.food.restaurant.dto.menu

import com.food.restaurant.entity.menu.OptionIngredient
import com.food.restaurant.entity.stock.MeasurementUnits
import java.math.BigDecimal

data class OptionIngredientResponse(
    val stockId: Int,
    val stockName: String,
    val amount: BigDecimal,
    val measureUnit: MeasurementUnits,
    val availableStock: BigDecimal
) {
    companion object {
        fun from(optionIngredient: OptionIngredient) = OptionIngredientResponse(
            stockId = optionIngredient.stock.id,
            stockName = optionIngredient.stock.name,
            amount = optionIngredient.amount,
            measureUnit = optionIngredient.measureUnit,
            availableStock = optionIngredient.stock.amount
        )
    }
}
