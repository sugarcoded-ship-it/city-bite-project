package com.food.restaurant.repository

import com.food.restaurant.entity.stock.StockCategory
import com.food.restaurant.entity.stock.stockCategoryEnum
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StockCategoryRepository : JpaRepository<StockCategory, Int> {
    fun findByName(name: stockCategoryEnum): StockCategory?
}