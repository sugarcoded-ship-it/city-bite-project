package com.food.restaurant.dto.store

import java.math.BigDecimal

data class OwnerDashboardDto(
    val revenueToday: BigDecimal,
    val totalOrdersToday: Long,
    val completedOrdersToday: Long,
    val activeStaffCount: Long,
    val pendingLeaveRequests: Long,
    val totalMenuItems: Long,
    val availableMenuItems: Long,
    val isStoreOpen: Boolean,
    val storeName: String

)