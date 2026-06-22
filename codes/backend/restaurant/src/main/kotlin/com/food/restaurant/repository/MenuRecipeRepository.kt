package com.food.restaurant.repository

import com.food.restaurant.entity.menu.MenuRecipe
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MenuRecipeRepository : JpaRepository<MenuRecipe, Int> {
    fun findByMenuItem_Id(menuId: Int): List<MenuRecipe>
    fun deleteByMenuItem_Id(menuId: Int)
}