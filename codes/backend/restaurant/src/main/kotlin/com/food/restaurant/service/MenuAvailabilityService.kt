package com.food.restaurant.service

import com.food.restaurant.entity.menu.MenuItem
import com.food.restaurant.entity.menu.MenuStatus
import com.food.restaurant.entity.menu.menuStatusEnum
import com.food.restaurant.repository.menu.MenuRecipeRepository
import com.food.restaurant.repository.menu.MenuRepository
import com.food.restaurant.repository.menu.MenuStatusRepository
import org.springframework.stereotype.Service

@Service
class MenuAvailabilityService(
    private val menuRecipeRepository: MenuRecipeRepository,
    private val menuRepository: MenuRepository,
    private val menuStatusRepository: MenuStatusRepository
) {
    fun isAvailable(menuItem: MenuItem): Boolean {
        val recipe = menuRecipeRepository.findByMenuItem_Id(menuItem.id)
        return recipe.all { it.stock.amount >= it.amount }
    }

    // DEACTIVATED is always a deliberate owner action and is never overridden here.
    // ACTIVE/OUT_OF_ORDER is purely derived from current stock levels.
    fun syncStatus(menuItem: MenuItem): MenuItem {
        if (menuItem.status.name == menuStatusEnum.DEACTIVATED) return menuItem

        val target = if (isAvailable(menuItem)) menuStatusEnum.ACTIVE else menuStatusEnum.OUT_OF_ORDER
        if (menuItem.status.name != target) {
            menuItem.status = resolveStatusEntity(target)
            menuRepository.save(menuItem)
        }
        return menuItem
    }

    fun resolveStatusEntity(statusEnum: menuStatusEnum): MenuStatus {
        return menuStatusRepository.findByName(statusEnum)
            ?: menuStatusRepository.save(MenuStatus(name = statusEnum))
    }
}