package com.food.restaurant.repository

import com.food.restaurant.entity.menu.CartItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CartRepository : JpaRepository<CartItem, Int> {
    fun findByUserIdAndMenuItemId(userId: String, menuId: Int): CartItem?
    fun findAllByUserId(userId: String): List<CartItem>
}