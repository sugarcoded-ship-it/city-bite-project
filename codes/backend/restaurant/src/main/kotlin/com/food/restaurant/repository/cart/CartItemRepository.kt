package com.food.restaurant.repository.cart

import com.food.restaurant.entity.cart.CartItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CartItemRepository : JpaRepository<CartItem, Int> {
    fun findByCustomerUuid(customerUuid: UUID): List<CartItem>
    fun deleteByCustomerUuid(customerUuid: UUID)
}