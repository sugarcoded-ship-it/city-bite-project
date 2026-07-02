package com.food.restaurant.repository.menu

import com.food.restaurant.entity.menu.MenuCategory
import com.food.restaurant.entity.menu.menuCategoryEnum
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MenuCategoryRepository : JpaRepository<MenuCategory, Int> {
    fun findByName(name: menuCategoryEnum): MenuCategory?
}