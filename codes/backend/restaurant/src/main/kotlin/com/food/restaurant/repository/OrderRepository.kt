package com.food.restaurant.repository

import com.food.restaurant.entity.order.Order
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface OrderRepository : JpaRepository<Order, Int> {
    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE DATE(o.createdAt) = CURRENT_DATE")
    fun sumRevenueToday(): BigDecimal
    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.createdAt) = CURRENT_DATE")
    fun countOrdersToday(): Long
    @Query("SELECT COUNT(o) FROM Order o JOIN o.orderStatus os WHERE DATE(o.createdAt) = CURRENT_DATE AND os.statusName = 'Completed'")
    fun countCompletedOrdersToday(): Long
}