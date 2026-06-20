package com.food.restaurant.service

import com.food.restaurant.controller.customer.HomeController.CartItemResponse
import com.food.restaurant.entity.cart.CartItem
import com.food.restaurant.entity.cart.CartItemSelection
import com.food.restaurant.repository.cart.CartItemRepository
import com.food.restaurant.repository.MenuRepository
import com.food.restaurant.repository.OptionChoiceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class CartService(
    private val cartItemRepository: CartItemRepository,
    private val menuRepository: MenuRepository,
    private val optionChoiceRepository: OptionChoiceRepository
) {

    fun addItem(userId: String, menuId: Int, specialRequest: String?, selectedChoices: Map<Int, List<Int>>, quantity: Int = 1) {
        val userUuid = UUID.fromString(userId)
        val userCart = cartItemRepository.findByCustomerUuid(userUuid)
        val incomingChoiceIds = selectedChoices.values.flatten().sorted()

        val existingItem = userCart.find { item ->
            val itemChoiceIds = item.selections.map { it.choiceId }.sorted()
            item.menuItem.id == menuId &&
                    item.specialRequest == specialRequest &&
                    itemChoiceIds == incomingChoiceIds
        }

        if (existingItem != null) {
            existingItem.quantity += quantity
            cartItemRepository.save(existingItem)
        } else {
            val menuItem = menuRepository.findById(menuId)
                .orElseThrow { IllegalArgumentException("Menu item not found") }

            val newCartItem = CartItem(
                customerUuid = userUuid,
                menuItem = menuItem,
                quantity = quantity,
                specialRequest = specialRequest
            )

            incomingChoiceIds.forEach { choiceId ->
                newCartItem.selections.add(CartItemSelection(cartItem = newCartItem, choiceId = choiceId))
            }

            cartItemRepository.save(newCartItem)
        }
    }

    @Transactional(readOnly = true)
    fun getCartItemsForUser(userId: String): List<CartItemResponse> {
        val userUuid = UUID.fromString(userId)
        val dbItems = cartItemRepository.findByCustomerUuid(userUuid)

        return dbItems.map { item ->
            val choiceIds = item.selections.map { it.choiceId }
            val databaseChoices = optionChoiceRepository.findAllById(choiceIds)

            val basePrice = item.menuItem.price.toDouble()
            val extraCost = databaseChoices.sumOf { it.extraPrice.toDouble() }
            val finalCalculatedPrice = basePrice + extraCost

            CartItemResponse(
                menuId = item.menuItem.id,
                name = item.menuItem.name,
                price = finalCalculatedPrice,
                quantity = item.quantity,
                specialRequest = item.specialRequest,
                selectedCustomizations = databaseChoices.map { it.choiceName }
            )
        }
    }

    fun clearCartForUser(userId: String) {
        cartItemRepository.deleteByCustomerUuid(UUID.fromString(userId))
    }

    fun updateQuantityByIndex(userId: String, itemIndex: Int, change: Int) {
        val userUuid = UUID.fromString(userId)
        val userCart = cartItemRepository.findByCustomerUuid(userUuid)

        if (itemIndex in userCart.indices) {
            val targetItem = userCart[itemIndex]
            val prospectiveQuantity = targetItem.quantity + change

            if (prospectiveQuantity <= 0) {
                cartItemRepository.delete(targetItem)
            } else {
                targetItem.quantity = prospectiveQuantity
                cartItemRepository.save(targetItem)
            }
        }
    }

    fun removeItemByIndex(userId: String, itemIndex: Int) {
        val userUuid = UUID.fromString(userId)
        val userCart = cartItemRepository.findByCustomerUuid(userUuid)

        if (itemIndex in userCart.indices) {
            cartItemRepository.delete(userCart[itemIndex])
        }
    }
}