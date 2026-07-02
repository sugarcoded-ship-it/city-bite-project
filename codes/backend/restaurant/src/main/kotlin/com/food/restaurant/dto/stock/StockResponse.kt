package com.food.restaurant.dto.stock

import com.food.restaurant.entity.stock.MeasurementUnits
import com.food.restaurant.entity.stock.Stock
import java.math.BigDecimal

data class StockResponse(
    val id: Int,
    val name: String,
    val description: String?,
    val amount: BigDecimal,
    val measureUnit: MeasurementUnits,
    val categoryId: Int,
) {
    companion object {
        fun from(stock: Stock) = StockResponse(
            id = stock.id,
            name = stock.name,
            description = stock.description,
            amount = stock.amount,
            measureUnit = stock.measureUnit,
            categoryId = stock.stockCategory.id,
        )
    }
}