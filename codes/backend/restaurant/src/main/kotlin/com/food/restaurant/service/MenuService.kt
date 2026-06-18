package com.food.restaurant.service

import com.food.restaurant.dto.menu.MenuItemResponse
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.entity.menu.menuStatusEnum
import com.food.restaurant.repository.MenuRepository
import org.springframework.stereotype.Service

@Service
class MenuService(private val menuRepository: MenuRepository) {

    fun getAvailableMenu(category: menuCategoryEnum?): List<MenuItemResponse> {
        val menuItems = if (category != null) {
            menuRepository.findByStatus_NameAndCategory_Name(menuStatusEnum.ACTIVE, category)
        } else {
            menuRepository.findByStatus_Name(menuStatusEnum.ACTIVE)
        }
        return menuItems.map { MenuItemResponse.from(it) }
    }
}
