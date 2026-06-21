package com.food.restaurant.repository

import com.food.restaurant.entity.menu.MenuItem
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.entity.menu.menuStatusEnum
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface MenuRepository : JpaRepository<MenuItem, Int> {
    fun findByStatus_Name(statusName: menuStatusEnum): List<MenuItem>
    fun findByStatus_NameAndCategory_Name(statusName: menuStatusEnum, categoryName: menuCategoryEnum): List<MenuItem>

    @Query("SELECT COUNT(m) FROM MenuItem m JOIN m.status s WHERE s.name = 'Available'")
    fun countAvailableItems(): Long
}
