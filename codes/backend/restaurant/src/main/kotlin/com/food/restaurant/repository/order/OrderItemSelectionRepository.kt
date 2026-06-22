package com.food.restaurant.repository.order

import com.food.restaurant.entity.order.OrderItemSelection
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OrderItemSelectionRepository : JpaRepository<OrderItemSelection, Int> {
    fun findByOrderDetailId(orderDetailId: Int): List<OrderItemSelection>
}