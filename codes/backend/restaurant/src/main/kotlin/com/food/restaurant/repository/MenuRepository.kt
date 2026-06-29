package com.food.restaurant.repository

import com.food.restaurant.entity.menu.MenuItem
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.entity.menu.menuStatusEnum
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MenuRepository : JpaRepository<MenuItem, Int> {
    fun findByStatus_Name(statusName: menuStatusEnum): List<MenuItem>
    fun findByStatus_NameAndCategory_Name(statusName: menuStatusEnum, categoryName: menuCategoryEnum): List<MenuItem>
    fun findByCategory_Name(categoryName: menuCategoryEnum): List<MenuItem>

    fun countByStatus_Name(statusName: menuStatusEnum): Long
}
