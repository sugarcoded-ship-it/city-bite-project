package com.food.restaurant.repository.analytics

import com.food.restaurant.entity.analytics.FinancialEvent
import com.food.restaurant.entity.analytics.FinancialEventType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDateTime

@Repository
interface FinancialEventRepository : JpaRepository<FinancialEvent, Long> {

    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM FinancialEvent e
        WHERE e.eventType = :eventType
          AND e.createdAt >= :from
          AND e.createdAt < :to
    """)
    fun sumByTypeAndDateRange(eventType: FinancialEventType, from: LocalDateTime, to: LocalDateTime): BigDecimal

    fun findTop10ByOrderByCreatedAtDesc(): List<FinancialEvent>
}
