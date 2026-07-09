package com.food.restaurant.service.menu

import com.food.restaurant.dto.menu.MenuItemResponse
import com.food.restaurant.dto.menu.OptionGroupResponse
import com.food.restaurant.dto.menu.OptionChoiceResponse
import com.food.restaurant.dto.menu.OptionIngredientResponse
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.repository.stock.OptionIngredientRepository
import com.food.restaurant.repository.menu.MenuRepository
import com.food.restaurant.repository.menu.OptionGroupRepository
import com.food.restaurant.repository.menu.OptionChoiceRepository
import org.springframework.stereotype.Service

@Service
class MenuService(
    private val menuRepository: MenuRepository,
    private val optionGroupRepository: OptionGroupRepository,
    private val optionChoiceRepository: OptionChoiceRepository,
    private val optionIngredientRepository: OptionIngredientRepository,
    private val menuAvailabilityService: MenuAvailabilityService
) {


    fun getAvailableMenu(category: menuCategoryEnum?): List<MenuItemResponse> {
        val menuItems = if (category != null) {
            menuRepository.findByCategory_Name(category)
        } else {
            menuRepository.findAll()
        }
        return menuItems.map { MenuItemResponse.from(menuAvailabilityService.syncStatus(it)) }
    }

    // Each choice's availability is derived from the stock backing its own ingredients,
    // independent of the base menu item's recipe/status.
    fun getMenuItemCustomizations(menuId: Int): List<OptionGroupResponse> {
        val groups = optionGroupRepository.findByMenuItem_Id(menuId)
        if (groups.isEmpty()) return emptyList()

        val groupIds = groups.map { it.id }
        val choices = optionChoiceRepository.findByOptionGroup_IdIn(groupIds)
        val choicesByGroupId = choices.groupBy { it.optionGroup.id }

        val choiceIds = choices.map { it.id }
        val ingredients = if (choiceIds.isNotEmpty()) optionIngredientRepository.findByOptionChoiceIdIn(choiceIds) else emptyList()
        val ingredientsByChoiceId = ingredients.groupBy { it.optionChoice.id }

        return groups.map { group ->
            val choicesForGroup = choicesByGroupId[group.id] ?: emptyList()

            OptionGroupResponse(
                id = group.id,
                groupName = group.groupName,
                isRequired = group.isRequired,
                maxChoices = group.maxChoices,
                choices = choicesForGroup.map { choice ->
                    val choiceIngredients = ingredientsByChoiceId[choice.id] ?: emptyList()
                    OptionChoiceResponse(
                        choiceId = choice.id,
                        choiceName = choice.choiceName,
                        extraPrice = choice.extraPrice.toDouble(),
                        available = choiceIngredients.all { it.stock.amount >= it.amount },
                        ingredients = choiceIngredients.map { OptionIngredientResponse.from(it) }
                    )
                }
            )
        }
    }
}