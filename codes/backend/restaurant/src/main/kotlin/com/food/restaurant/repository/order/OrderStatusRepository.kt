package com.food.restaurant.repository.order

import com.food.restaurant.entity.order.OrderStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OrderStatusRepository: JpaRepository<OrderStatus, Int> {
    fun findByStatusName(name: String): OrderStatus
}