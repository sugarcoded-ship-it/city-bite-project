package com.food.restaurant.repository.order

import com.food.restaurant.entity.order.OrderDetail
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OrderDetailRepository : JpaRepository<OrderDetail, Int> {
    fun findByOrderId(orderId: Int): List<OrderDetail>
}