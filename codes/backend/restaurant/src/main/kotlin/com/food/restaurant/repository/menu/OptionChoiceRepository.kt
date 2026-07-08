package com.food.restaurant.repository.menu

import com.food.restaurant.entity.menu.OptionChoice
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OptionChoiceRepository : JpaRepository<OptionChoice, Int> {
    fun findByOptionGroup_Id(groupId: Int): List<OptionChoice>
    fun findByOptionGroup_IdIn(groupIds: List<Int>): List<OptionChoice>
    fun deleteByOptionGroup_Id(groupId: Int)
}
