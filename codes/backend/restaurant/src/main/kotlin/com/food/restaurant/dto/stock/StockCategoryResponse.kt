package com.food.restaurant.dto.stock

import com.food.restaurant.entity.stock.StockCategoryEnum

data class StockCategoryResponse(
    val id: Int,
    val name: StockCategoryEnum,
)