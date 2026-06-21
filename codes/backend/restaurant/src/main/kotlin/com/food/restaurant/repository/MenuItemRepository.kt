package com.food.restaurant.repository

import com.food.restaurant.entity.menu.MenuItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MenuItemRepository: JpaRepository<MenuItem, Int> {
    // I implement these in case for the future uses of the feature menu filter page
    fun findByIsAvailableTrue(): List<MenuItem>

    fun findByCategory_Id(categoryId: Int): List<MenuItem>
}