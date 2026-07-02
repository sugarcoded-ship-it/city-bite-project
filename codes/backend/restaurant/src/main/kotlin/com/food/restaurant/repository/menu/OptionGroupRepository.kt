package com.food.restaurant.repository.menu

import com.food.restaurant.entity.menu.OptionGroup
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OptionGroupRepository : JpaRepository<OptionGroup, Int> {
    fun findByMenuItem_Id(menuId: Int): List<OptionGroup>
}