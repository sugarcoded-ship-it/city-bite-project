package com.food.restaurant.dto.stock
import java.math.BigDecimal
data class StockAdjustment(val itemId: Int, val newAmount: BigDecimal)