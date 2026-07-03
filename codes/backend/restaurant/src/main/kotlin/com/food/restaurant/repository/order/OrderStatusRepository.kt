package com.food.restaurant.repository.order

import com.food.restaurant.entity.order.OrderStatus
import com.food.restaurant.entity.order.orderStatusEnum
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OrderStatusRepository : JpaRepository<OrderStatus, Int> {
    fun findByStatusName(statusName: orderStatusEnum): OrderStatus?
}