package com.food.restaurant.service

import com.food.restaurant.dto.menu.MenuItemResponse
import com.food.restaurant.dto.menu.OptionGroupResponse
import com.food.restaurant.dto.menu.OptionChoiceResponse
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.entity.menu.menuStatusEnum
import com.food.restaurant.repository.MenuRepository
import com.food.restaurant.repository.OptionGroupRepository
import com.food.restaurant.repository.OptionChoiceRepository // Inject this new repo
import org.springframework.stereotype.Service

@Service
class MenuService(
    private val menuRepository: MenuRepository,
    private val optionGroupRepository: OptionGroupRepository,
    private val optionChoiceRepository: OptionChoiceRepository // Add here
) {

    fun getAvailableMenu(category: menuCategoryEnum?): List<MenuItemResponse> {
        val menuItems = if (category != null) {
            menuRepository.findByStatus_NameAndCategory_Name(menuStatusEnum.ACTIVE, category)
        } else {
            menuRepository.findByStatus_Name(menuStatusEnum.ACTIVE)
        }
        return menuItems.map { MenuItemResponse.from(it) }
    }

    fun getMenuItemCustomizations(menuId: Int): List<OptionGroupResponse> {
        val groups = optionGroupRepository.findByMenuItem_Id(menuId)

        return groups.map { group ->
            val choicesForGroup = optionChoiceRepository.findByOptionGroup_Id(group.id)

            OptionGroupResponse(
                id = group.id,
                groupName = group.groupName,
                isRequired = group.isRequired,
                maxChoices = group.maxChoices,
                choices = choicesForGroup.map { choice ->
                    OptionChoiceResponse(
                        choiceId = choice.id,
                        choiceName = choice.choiceName,
                        extraPrice = choice.extraPrice.toDouble()
                    )
                }
            )
        }
    }
}