package com.food.restaurant.repository.order

import com.food.restaurant.entity.order.Order
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface OrderSummaryRepository: JpaRepository<Order, Int> {
    fun findByCustomer_Id(customerId: UUID): List<Order>

    fun findByStaff_Id(staffId: UUID): List<Order>

    fun findByOrderStatus_Id(statusId: Int): List<Order>
}