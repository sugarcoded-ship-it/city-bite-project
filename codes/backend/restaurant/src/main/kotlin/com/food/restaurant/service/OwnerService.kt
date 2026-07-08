package com.food.restaurant.service

import com.food.restaurant.dto.user.owner.OwnerAnalyticsDto
import com.food.restaurant.dto.user.owner.OwnerDashboardDto
import com.food.restaurant.dto.user.owner.RecentTransaction
import com.food.restaurant.dto.user.owner.WeeklyFinancePoint
import com.food.restaurant.entity.analytics.FinancialEvent
import com.food.restaurant.entity.analytics.FinancialEventType
import com.food.restaurant.entity.menu.menuStatusEnum
import com.food.restaurant.entity.user.StaffStatus
import com.food.restaurant.repository.analytics.FinancialEventRepository
import com.food.restaurant.repository.menu.MenuRepository
import com.food.restaurant.repository.order.OrderRepository
import com.food.restaurant.repository.store.StoreRepository
import com.food.restaurant.repository.user.LeaveDayRepository
import com.food.restaurant.repository.user.StaffRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Service
class OwnerService(
    private val orderRepository: OrderRepository,
    private val staffRepository: StaffRepository,
    private val leaveDayRepository: LeaveDayRepository,
    private val menuRepository: MenuRepository,
    private val storeRepository: StoreRepository,
    private val financialEventRepository: FinancialEventRepository
) {

    @Transactional(readOnly = true)
    fun getAnalyticsMetrics(): OwnerAnalyticsDto {
        val now = java.time.LocalDateTime.now()
        val startOfWindow = now.minusDays(6).withHour(0).withMinute(0).withSecond(0).withNano(0)
        val endOfWindow = now.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)

        val weeklyFlow = mutableListOf<WeeklyFinancePoint>()
        var current = startOfWindow
        while (!current.isAfter(now)) {
            val dayStart = current.withHour(0).withMinute(0).withSecond(0).withNano(0)
            val dayEnd = dayStart.plusDays(1)
            val inflow = financialEventRepository.sumByTypeAndDateRange(FinancialEventType.INCOME, dayStart, dayEnd)
            val outflow = financialEventRepository.sumByTypeAndDateRange(FinancialEventType.EXPENSE, dayStart, dayEnd)
            weeklyFlow.add(
                WeeklyFinancePoint(
                    label = dayStart.dayOfWeek.name.lowercase().replaceFirstChar { it.titlecase() }.take(3),
                    inflow = inflow,
                    outflow = outflow
                )
            )
            current = current.plusDays(1)
        }

        val totalInflow = financialEventRepository.sumByTypeAndDateRange(FinancialEventType.INCOME, startOfWindow, endOfWindow)
        val totalOutflow = financialEventRepository.sumByTypeAndDateRange(FinancialEventType.EXPENSE, startOfWindow, endOfWindow)
        val recentTransactions = financialEventRepository.findTop10ByOrderByCreatedAtDesc().map {
            RecentTransaction(
                title = it.description,
                amount = it.amount,
                note = it.createdAt.toLocalDate().toString(),
                type = it.eventType.name.lowercase()
            )
        }

        return OwnerAnalyticsDto(
            totalInflow = totalInflow,
            totalOutflow = totalOutflow,
            netProfit = totalInflow - totalOutflow,
            cashReserve = (totalInflow - totalOutflow) * BigDecimal("0.22"),
            weeklyFlow = weeklyFlow.takeLast(7),
            recentTransactions = recentTransactions
        )
    }

    @Transactional
    fun seedAnalyticsTestData(events: List<AnalyticsSeedEntry>? = null): List<FinancialEvent> {
        financialEventRepository.deleteAll()

        val seedEvents = events?.map { entry ->
            val createdAt = LocalDateTime.now()
                .minusDays(entry.daysAgo)
                .withHour(entry.hour)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)

            FinancialEvent(
                eventType = FinancialEventType.valueOf(entry.eventType.uppercase()),
                amount = entry.amount,
                description = entry.description,
                createdAt = createdAt
            )
        } ?: buildDefaultAnalyticsSeedEvents()

        return financialEventRepository.saveAll(seedEvents)
    }

    private fun buildDefaultAnalyticsSeedEvents(): List<FinancialEvent> {
        val now = LocalDateTime.now()
        return listOf(
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("12500"), description = "Lunch service", createdAt = now.withHour(13).withMinute(20).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("8400"), description = "Delivery orders", createdAt = now.withHour(11).withMinute(45).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("6200"), description = "Ingredient restock", createdAt = now.withHour(9).withMinute(10).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("111400"), description = "Staff wages", createdAt = now.withHour(8).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("16800"), description = "Evening dine-in", createdAt = now.minusDays(1).withHour(19).withMinute(30).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("3100"), description = "Utilities", createdAt = now.minusDays(1).withHour(22).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("32000"), description = "Monday sales", createdAt = now.minusDays(6).withHour(20).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("14500"), description = "Monday supplies", createdAt = now.minusDays(6).withHour(16).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("28500"), description = "Tuesday sales", createdAt = now.minusDays(5).withHour(20).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("13800"), description = "Tuesday supplies", createdAt = now.minusDays(5).withHour(16).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("41000"), description = "Wednesday sales", createdAt = now.minusDays(4).withHour(20).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("15600"), description = "Wednesday supplies", createdAt = now.minusDays(4).withHour(16).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("37500"), description = "Thursday sales", createdAt = now.minusDays(3).withHour(20).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("14900"), description = "Thursday supplies", createdAt = now.minusDays(3).withHour(16).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("52000"), description = "Friday sales", createdAt = now.minusDays(2).withHour(20).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("17200"), description = "Friday supplies", createdAt = now.minusDays(2).withHour(16).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("61000"), description = "Saturday sales", createdAt = now.minusDays(1).withHour(20).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("18800"), description = "Saturday supplies", createdAt = now.minusDays(1).withHour(16).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.INCOME, amount = BigDecimal("46500"), description = "Sunday sales", createdAt = now.withHour(20).withMinute(0).withSecond(0).withNano(0)),
            FinancialEvent(eventType = FinancialEventType.EXPENSE, amount = BigDecimal("16100"), description = "Sunday supplies", createdAt = now.withHour(16).withMinute(0).withSecond(0).withNano(0))
        )
    }

    @Transactional(readOnly = true)
    fun getDashboardMetrics(ownerUuid: UUID): OwnerDashboardDto {

        val revenueToday = try { orderRepository.sumRevenueToday() } catch (e: Exception) { BigDecimal.ZERO }
        val totalOrdersToday = try { orderRepository.countOrdersToday() } catch (e: Exception) { 0L }
        val completedOrdersToday = try { orderRepository.countCompletedOrdersToday() } catch (e: Exception) { 0L }

        val activeStaffCount = try {
            staffRepository.countByStatus(StaffStatus.ACTIVE)
        } catch (e: Exception) {
            0L
        }

        val pendingLeaveRequests = try { leaveDayRepository.countByStatus("PENDING") } catch (e: Exception) { 0L }

        val totalMenuItems = try { menuRepository.count() } catch (e: Exception) { 0L }
        val availableMenuItems = try { menuRepository.countByStatus_Name(menuStatusEnum.ACTIVE) } catch (e: Exception) { 0L }


        val store = try {
            storeRepository
                .findByOwnerId(ownerUuid)
        } catch (e: Exception) {
            null
        }

        // TODO: Check with real time whether it is actually open or close
        // TODO: Get store name from database as well
        val isStoreOpen = store?.isOpen ?: false
        val storeName = store?.storeName ?: ""

        return OwnerDashboardDto(
            revenueToday = revenueToday,
            totalOrdersToday = totalOrdersToday,
            completedOrdersToday = completedOrdersToday,
            activeStaffCount = activeStaffCount,
            pendingLeaveRequests = pendingLeaveRequests,
            totalMenuItems = totalMenuItems,
            availableMenuItems = availableMenuItems,
            isStoreOpen = isStoreOpen,
            storeName = storeName
        )
    }
}

data class AnalyticsSeedEntry(
    val eventType: String,
    val amount: BigDecimal,
    val description: String,
    val daysAgo: Long = 0,
    val hour: Int = 12
)