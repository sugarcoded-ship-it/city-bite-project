package com.food.restaurant.repository

import com.food.restaurant.entity.order.Order
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface OrderRepository : JpaRepository<Order, Int> {

    @Query(
        value = "SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE",
        nativeQuery = true
    )
    fun sumRevenueToday(): BigDecimal

    @Query(
        value = "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE",
        nativeQuery = true
    )
    fun countOrdersToday(): Long

    @Query(
        value = """
            SELECT COUNT(*) FROM orders o 
            JOIN order_status os ON o.order_status_id = os.order_status_id 
            WHERE DATE(o.created_at) = CURRENT_DATE AND os.status_name = 'Completed'
        """,
        nativeQuery = true
    )
    fun countCompletedOrdersToday(): Long
}