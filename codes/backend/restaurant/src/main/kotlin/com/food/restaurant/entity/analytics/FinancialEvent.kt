package com.food.restaurant.entity.analytics

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "financial_events")
class FinancialEvent(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "financial_event_id")
    var id: Long = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    var eventType: FinancialEventType = FinancialEventType.INCOME,

    @Column(name = "amount", nullable = false)
    var amount: BigDecimal = BigDecimal.ZERO,

    @Column(name = "description", nullable = false)
    var description: String = "",

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)

enum class FinancialEventType {
    INCOME,
    EXPENSE
}
