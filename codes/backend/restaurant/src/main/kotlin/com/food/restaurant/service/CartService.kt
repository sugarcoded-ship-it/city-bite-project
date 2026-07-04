package com.food.restaurant.service

import com.food.restaurant.dto.cart.CartItemResponse
import com.food.restaurant.entity.cart.CartItem
import com.food.restaurant.entity.cart.CartItemSelection
import com.food.restaurant.entity.user.User
import com.food.restaurant.repository.cart.CartItemRepository
import com.food.restaurant.repository.menu.MenuRepository
import com.food.restaurant.repository.menu.OptionChoiceRepository
import com.food.restaurant.repository.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class CartService(
    private val cartItemRepository: CartItemRepository,
    private val menuRepository: MenuRepository,
    private val optionChoiceRepository: OptionChoiceRepository,
    private val userRepository: UserRepository,
    private val menuAvailabilityService: MenuAvailabilityService
) {

    fun addItem(
        userId: String,
        menuId: Int,
        specialRequest: String?,
        selectedChoices: Map<String, List<Int>>?,
        quantity: Int = 1
    ) {
        val userUuid = UUID.fromString(userId)

        if (!userRepository.existsById(userUuid)) {
            userRepository.saveAndFlush(
                User(
                    id = userUuid,
                    username = "user_${userId.take(8)}",
                    email = "$userId@placeholder.com",
                    firstName = null,
                    lastName = null
                )
            )
        }

        val userCart = cartItemRepository.findByCustomerUuid(userUuid)

        val choicesMap = selectedChoices ?: emptyMap()
        val incomingChoiceIds = choicesMap.values.flatten().sorted()

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
                .orElseThrow { RuntimeException("Menu item not found") }

            val newItem = CartItem(
                customerUuid = userUuid,
                menuItem = menuItem,
                quantity = quantity,
                specialRequest = specialRequest
            )

            val savedItem = cartItemRepository.save(newItem)

            val selections = choicesMap.values.flatten().map { choiceId ->
                CartItemSelection(cartItem = savedItem, choiceId = choiceId)
            }
            savedItem.selections.addAll(selections)
            cartItemRepository.save(savedItem)
        }
    }

    fun getCartItemsForUser(userId: String): List<CartItemResponse> {
        val userUuid = UUID.fromString(userId)
        val userCart = cartItemRepository.findByCustomerUuid(userUuid)

        return userCart.map { item ->
            val basePrice = item.menuItem.price.toDouble()
            val choiceIds = item.selections.map { it.choiceId }
            val databaseChoices = optionChoiceRepository.findAllById(choiceIds)

            val extraCost = databaseChoices.sumOf { it.extraPrice.toDouble() }
            val finalCalculatedPrice = basePrice + extraCost
            val resolvedMenuItem = menuAvailabilityService.syncStatus(item.menuItem)

            CartItemResponse(
                menuId = item.menuItem.id,
                name = item.menuItem.name,
                price = finalCalculatedPrice,
                quantity = item.quantity,
                specialRequest = item.specialRequest,
                selectedCustomizations = databaseChoices.map { it.choiceName },
                selectedChoiceIds = choiceIds,
                status = resolvedMenuItem.status.name.name
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

    @Transactional
    fun clearCartForUser(userId: UUID) {
        cartItemRepository.deleteByCustomerUuid(userId)
    }
}