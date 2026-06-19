package com.food.restaurant.repository

import com.food.restaurant.entity.stock.Stock
import org.springframework.data.jpa.repository.JpaRepository

interface StockRepository : JpaRepository<Stock, Int> {
    fun findAllByStockCategoryId(categoryId: Int): List<Stock>
}