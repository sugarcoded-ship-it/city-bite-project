package com.food.restaurant.repository

import com.food.restaurant.entity.stock.Stock
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StockRepository : JpaRepository<Stock, Int> {
    fun findAllByStockCategoryId(categoryId: Int): List<Stock>
}