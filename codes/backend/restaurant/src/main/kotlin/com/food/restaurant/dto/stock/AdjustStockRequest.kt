package com.food.restaurant.dto.stock

import java.math.BigDecimal

data class AdjustStockRequest(
    val delta: BigDecimal,
)