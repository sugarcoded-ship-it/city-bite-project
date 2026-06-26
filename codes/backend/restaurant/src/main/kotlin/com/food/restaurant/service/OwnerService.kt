package com.food.restaurant.service

import com.food.restaurant.dto.user.owner.OwnerDashboardDto
import com.food.restaurant.entity.menu.menuStatusEnum
import com.food.restaurant.entity.user.StaffStatus
import com.food.restaurant.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
class OwnerService(
    private val orderRepository: OrderRepository,
    private val staffRepository: StaffRepository,
    private val leaveDayRepository: LeaveDayRepository,
    private val menuRepository: MenuRepository,
    private val storeRepository: StoreRepository
) {

    @Transactional(readOnly = true)
    fun getDashboardMetrics(ownerUuid: UUID): OwnerDashboardDto {

        val revenueToday = try {
            orderRepository.sumRevenueToday() ?: BigDecimal.ZERO
        } catch (e: Exception) {
            BigDecimal.ZERO
        }

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
            storeRepository.findByOwner_Id(ownerUuid).orElse(null)
        } catch (e: Exception) {
            null
        }
        val isStoreOpen = store?.isOpen ?: false

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