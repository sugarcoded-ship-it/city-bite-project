package com.food.restaurant.dto.user.owner

import java.math.BigDecimal
import java.time.LocalDateTime

data class OwnerAnalyticsDto(
    val totalInflow: BigDecimal,
    val totalOutflow: BigDecimal,
    val netProfit: BigDecimal,
    val cashReserve: BigDecimal,
    val weeklyFlow: List<WeeklyFinancePoint>,
    val recentTransactions: List<RecentTransaction>
)

data class WeeklyFinancePoint(
    val label: String,
    val inflow: BigDecimal,
    val outflow: BigDecimal
)

data class RecentTransaction(
    val title: String,
    val amount: BigDecimal,
    val note: String,
    val type: String
)
