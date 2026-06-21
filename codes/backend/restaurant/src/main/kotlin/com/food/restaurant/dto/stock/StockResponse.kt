package com.food.restaurant.dto.stock

import com.food.restaurant.entity.MeasurementUnits
import java.math.BigDecimal


data class StockResponse(
    val id: Int,
    val name: String,
    val description: String?,
    val amount: BigDecimal,
    val measureUnit: MeasurementUnits,
    val categoryId: Int,
)