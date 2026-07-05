package com.food.restaurant.repository.order

import com.food.restaurant.entity.order.Order
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.util.UUID

@Repository
interface OrderRepository : JpaRepository<Order, Int> {

    @Query(
        value = """
            SELECT COALESCE(SUM(o.total_price), 0) FROM orders o
            JOIN order_status os ON o.order_status_id = os.order_status_id
            WHERE DATE(o.created_at) = CURRENT_DATE AND os.status_name = 'DELIVERED'
        """,
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
            WHERE DATE(o.created_at) = CURRENT_DATE AND os.status_name = 'DELIVERED'
        """,
        nativeQuery = true
    )
    fun countCompletedOrdersToday(): Long

    fun findByCustomerIdOrderByCreatedAtDesc(customerId: UUID, pageable: Pageable): Page<Order>

    @Query("""
        SELECT o FROM Order o 
        JOIN FETCH o.orderStatus os 
        JOIN FETCH o.customer 
        WHERE os.statusName IN :statuses 
        ORDER BY o.createdAt ASC
    """)
    fun findByOrderStatusIn(statuses: List<com.food.restaurant.entity.order.orderStatusEnum>): List<Order>
}