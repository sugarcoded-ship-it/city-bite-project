package com.food.restaurant.service

import com.food.restaurant.repository.MenuRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.util.concurrent.ConcurrentHashMap

data class CartItem(
    val id: Int,
    val name: String,
    val price: BigDecimal,
    var quantity: Int,
    var specialRequest: String? = null
)

@Service
class CartService(private val menuRepository: MenuRepository) {
    private val activeCarts = ConcurrentHashMap<String, MutableList<CartItem>>()

    fun addItem(userId: String, menuId: Int, specialRequest: String? = null, quantity: Int = 1) {
        val userCart = activeCarts.getOrPut(userId) { mutableListOf() }

        val existingItem = userCart.find { it.id == menuId && it.specialRequest == specialRequest }

        if (existingItem != null) {
            existingItem.quantity += quantity
        } else {
            val menuItem = menuRepository.findById(menuId)
                .orElseThrow { IllegalArgumentException("Menu item not found") }

            userCart.add(
                CartItem(
                    id = menuItem.id,
                    name = menuItem.name,
                    price = menuItem.price,
                    quantity = quantity,
                    specialRequest = specialRequest
                )
            )
        }
    }

    fun getCartItems(userId: String): List<CartItem> {
        return activeCarts[userId] ?: emptyList()
    }

    fun clearCartForUser(userId: String) {
        activeCarts.remove(userId)
    }
}