package com.food.restaurant.repository.stock

import com.food.restaurant.entity.menu.OptionIngredient
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OptionIngredientRepository : JpaRepository<OptionIngredient, Int> {
    fun findByOptionChoiceIdIn(choiceIds: List<Int>): List<OptionIngredient>
    fun deleteByOptionChoiceIdIn(choiceIds: List<Int>)
}