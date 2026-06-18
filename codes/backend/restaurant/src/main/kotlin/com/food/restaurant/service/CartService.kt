package com.food.restaurant.service

import com.food.restaurant.controller.customer.HomeController.CartItemResponse
import com.food.restaurant.repository.MenuRepository
import com.food.restaurant.repository.OptionChoiceRepository // Replace with your actual choices repository import
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

@Service
class CartService(
    private val menuRepository: MenuRepository,
    private val optionChoiceRepository: OptionChoiceRepository
) {
    // In-memory internal storage schema mapping a User UUID -> List of customizable sessions
    private val activeCarts = ConcurrentHashMap<String, MutableList<CartItemSession>>()

    data class CartItemSession(
        val menuId: Int,
        val specialRequest: String?,
        val selectedChoices: Map<Int, List<Int>>, // Tracks { optionGroupId: [choiceId1, choiceId2, ...] }
        var quantity: Int
    )

    fun addItem(userId: String, menuId: Int, specialRequest: String?, selectedChoices: Map<Int, List<Int>>, quantity: Int = 1) {
        val userCart = activeCarts.getOrPut(userId) { mutableListOf() }

        val existingItem = userCart.find {
            it.menuId == menuId &&
                    it.specialRequest == specialRequest &&
                    it.selectedChoices == selectedChoices
        }

        if (existingItem != null) {
            existingItem.quantity += quantity
        } else {
            userCart.add(
                CartItemSession(
                    menuId = menuId,
                    specialRequest = specialRequest,
                    selectedChoices = selectedChoices,
                    quantity = quantity
                )
            )
        }
    }

    fun getCartItemsForUser(userId: String): List<CartItemResponse> {
        val sessionItems = activeCarts[userId] ?: return emptyList()

        return sessionItems.mapNotNull { session ->
            val menuItem = menuRepository.findById(session.menuId).orElse(null) ?: return@mapNotNull null

            val choiceIds = session.selectedChoices.values.flatten()
            val databaseChoices = optionChoiceRepository.findAllById(choiceIds)

            val basePrice = menuItem.price.toDouble() // Assumes menuItem.price is BigDecimal or Double
            val extraCost = databaseChoices.sumOf { it.extraPrice.toDouble() } // Assumes choice.extraPrice is available
            val finalCalculatedPrice = basePrice + extraCost

            CartItemResponse(
                menuId = session.menuId,
                name = menuItem.name,
                price = finalCalculatedPrice,
                quantity = session.quantity,
                specialRequest = session.specialRequest,
                selectedCustomizations = databaseChoices.map { it.choiceName } // List<String> text array sent to client
            )
        }
    }

    fun clearCartForUser(userId: String) {
        activeCarts.remove(userId)
    }

    fun updateQuantityByIndex(userId: String, itemIndex: Int, change: Int) {
        val userCart = activeCarts[userId] ?: return

        if (itemIndex in userCart.indices) {
            val targetItem = userCart[itemIndex]
            val prospectiveQuantity = targetItem.quantity + change

            if (prospectiveQuantity <= 0) {
                userCart.removeAt(itemIndex)
            } else {
                targetItem.quantity = prospectiveQuantity
            }
        }
    }

    fun removeItemByIndex(userId: String, itemIndex: Int) {
        val userCart = activeCarts[userId] ?: return

        if (itemIndex in userCart.indices) {
            userCart.removeAt(itemIndex)
        }
    }
}