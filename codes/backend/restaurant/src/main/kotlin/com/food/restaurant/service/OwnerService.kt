package com.food.restaurant.service

import com.food.restaurant.repository.*
import com.food.restaurant.dto.user.owner.OwnerDashboardDto
import com.food.restaurant.repository.LeaveDayRepository
import com.food.restaurant.repository.MenuRepository
import com.food.restaurant.repository.OrderRepository
import com.food.restaurant.repository.StaffRepository
import com.food.restaurant.repository.StoreRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class OwnerDashboardService(
    private val orderRepository: OrderRepository,
    private val staffRepository: StaffRepository,
    private val leaveDayRepository: LeaveDayRepository,
    private val menuRepository: MenuRepository,
    private val storeRepository: StoreRepository
) {

    @Transactional(readOnly = true)
    fun getDashboardMetrics(ownerUuid: UUID): OwnerDashboardDto {
        val revenueToday = orderRepository.sumRevenueToday()
        val totalOrdersToday = orderRepository.countOrdersToday()
        val completedOrdersToday = orderRepository.countCompletedOrdersToday()

        val activeStaffCount = staffRepository.countByStatus("ACTIVATED")
        val pendingLeaveRequests = leaveDayRepository.countByStatus("Pending")

        val totalMenuItems = menuRepository.count()
        val availableMenuItems = menuRepository.countAvailableItems()

        val store = storeRepository.findByKeycloakUuid(ownerUuid)
            .orElseThrow { RuntimeException("Store records not available for authorized UUID scope.") }
        val isStoreOpen = store.isOpen ?: false

        return OwnerDashboardDto(
            revenueToday = revenueToday,
            totalOrdersToday = totalOrdersToday,
            completedOrdersToday = completedOrdersToday,
            activeStaffCount = activeStaffCount,
            pendingLeaveRequests = pendingLeaveRequests,
            totalMenuItems = totalMenuItems,
            availableMenuItems = availableMenuItems,
            isStoreOpen = isStoreOpen
        )
    }
}