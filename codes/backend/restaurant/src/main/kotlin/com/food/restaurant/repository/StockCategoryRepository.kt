package com.food.restaurant.repository

import com.food.restaurant.entity.stock.StockCategory
import org.springframework.data.jpa.repository.JpaRepository

interface StockCategoryRepository : JpaRepository<StockCategory, Int>