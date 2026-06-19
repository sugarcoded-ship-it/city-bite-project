package com.food.restaurant.dto.stock

import com.food.restaurant.entity.stock.stockCategoryEnum

data class StockCategoryResponse(
    val id: Int,
    val name: stockCategoryEnum,
)