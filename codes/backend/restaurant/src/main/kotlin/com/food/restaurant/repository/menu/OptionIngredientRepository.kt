package com.food.restaurant.repository.menu

import com.food.restaurant.entity.menu.OptionIngredient
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OptionIngredientRepository : JpaRepository<OptionIngredient, Int> {
    fun findByOptionChoiceIdIn(choiceIds: List<Int>): List<OptionIngredient>
    fun deleteByOptionChoiceIdIn(choiceIds: List<Int>)
    fun findByOptionChoiceId(choiceId: Int): List<OptionIngredient>
    fun deleteByOptionChoiceId(choiceId: Int)
}