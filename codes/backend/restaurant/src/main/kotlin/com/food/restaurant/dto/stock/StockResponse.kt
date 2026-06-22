package com.food.restaurant.dto.stock

import com.food.restaurant.entity.MeasurementUnits
import com.food.restaurant.entity.stock.Stock
import java.math.BigDecimal

data class StockResponse(
    val id: Int,
    val name: String,
    val category: String,
    val amount: BigDecimal,
    val measureUnit: MeasurementUnits
) {
    companion object {
        fun from(stock: Stock) = StockResponse(
            id = stock.id,
            name = stock.name,
            category = stock.stockCategory.name.displayName,
            amount = stock.amount,
            measureUnit = stock.measureUnit
        )
    }
}
