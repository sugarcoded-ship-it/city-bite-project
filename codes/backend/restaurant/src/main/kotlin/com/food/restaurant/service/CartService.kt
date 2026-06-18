package com.food.restaurant.service

import com.food.restaurant.entity.menu.CartItem
import com.food.restaurant.repository.CartRepository
import com.food.restaurant.repository.MenuRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CartService(
    private val cartRepository: CartRepository,
    private val menuRepository: MenuRepository
) {

    @Transactional
    fun addItem(userId: String, menuId: Int, quantity: Int = 1) {
        val existingItem = cartRepository.findByUserIdAndMenuItemId(userId, menuId)

        if (existingItem != null) {
            existingItem.quantity += quantity
            cartRepository.save(existingItem)
        } else {
            val menuItem = menuRepository.findById(menuId)
                .orElseThrow { IllegalArgumentException("Menu item not found") }

            val newItem = CartItem(
                userId = userId,
                menuItem = menuItem,
                quantity = quantity
            )
            cartRepository.save(newItem)
        }
    }

    fun getCartItems(userId: String): List<CartItem> {
        return cartRepository.findAllByUserId(userId)
    }

    @Transactional
    fun clearCartForUser(userUuid: String) {
        cartRepository.deleteByUserUuid(userUuid)
    }
}