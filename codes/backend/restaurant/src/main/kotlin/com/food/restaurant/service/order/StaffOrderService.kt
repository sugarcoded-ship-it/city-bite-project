package com.food.restaurant.service.order

import com.food.restaurant.dto.order.StaffOrderItemResponse
import com.food.restaurant.dto.order.StaffOrderResponse
import com.food.restaurant.entity.order.OrderDetail
import com.food.restaurant.entity.order.orderStatusEnum
import com.food.restaurant.repository.menu.MenuRecipeRepository
import com.food.restaurant.repository.OptionIngredientRepository
import com.food.restaurant.repository.order.OrderRepository
import com.food.restaurant.repository.stock.StockRepository
import com.food.restaurant.repository.user.UserRepository
import com.food.restaurant.repository.order.OrderDetailRepository
import com.food.restaurant.repository.order.OrderItemSelectionRepository
import com.food.restaurant.repository.order.OrderStatusRepository
import com.food.restaurant.service.RefundCreditService
import java.math.BigDecimal
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
@Transactional(readOnly = true)
class StaffOrderService(
    private val orderRepository: OrderRepository,
    private val orderDetailRepository: OrderDetailRepository,
    private val orderItemSelectionRepository: OrderItemSelectionRepository,
    private val orderStatusRepository: OrderStatusRepository,
    private val userRepository: UserRepository,
    private val menuRecipeRepository: MenuRecipeRepository,
    private val optionIngredientRepository: OptionIngredientRepository,
    private val stockRepository: StockRepository,
    private val orderCancellationService: OrderCancellationService,
    private val refundCreditService: RefundCreditService

) {

    fun getActiveOrders(): List<StaffOrderResponse> {
        val statuses = listOf(orderStatusEnum.PENDING, orderStatusEnum.IN_PROGRESS)
        val orders = orderRepository.findByOrderStatusIn(statuses)

        val orderIds = orders.map { it.id }
        val allDetails = if (orderIds.isNotEmpty()) {
            orderDetailRepository.findByOrderIdIn(orderIds)
        } else {
            emptyList()
        }

        val detailIds = allDetails.map { it.id }
        val allSelections = if (detailIds.isNotEmpty()) {
            orderItemSelectionRepository.findByOrderDetailIdIn(detailIds)
        } else {
            emptyList()
        }

        val selectionsByDetailId = allSelections.groupBy { it.orderDetail.id }
        val detailsByOrderId = allDetails.groupBy { it.order.id }

        return orders.map { order ->
            val details = detailsByOrderId[order.id] ?: emptyList()
            val address = order.address
            val addressString = listOfNotNull(
                address.addressInfo, address.subDistrict, address.district,
                address.province, address.postalCode
            ).joinToString(", ")

            val itemResponses = details.map { detail ->
                val selections = selectionsByDetailId[detail.id] ?: emptyList()
                StaffOrderItemResponse(
                    detailId = detail.id,
                    menuName = detail.menuItem.name,
                    quantity = detail.amount,
                    price = detail.price.toDouble(),
                    specialRequest = detail.specialRequest,
                    selectedOptions = selections.map { "${it.optionChoice.optionGroup.groupName}: ${it.optionChoice.choiceName}" },
                    isCanceled = detail.isCanceled
                )
            }

            val customerName = "${order.customer.firstName ?: ""} ${order.customer.lastName ?: ""}".trim()
            val staffName = order.staff?.let { "${it.firstName ?: ""} ${it.lastName ?: ""}".trim() }

            StaffOrderResponse(
                orderId = order.id,
                status = order.orderStatus.statusName.name,
                customerName = customerName.ifEmpty { order.customer.username },
                totalPrice = order.totalPrice.toDouble(),
                createdAt = order.createdAt.toString(),
                assignedStaffName = staffName,
                assignedStaffUuid = order.staff?.id?.toString(),
                deliveryAddress = addressString,
                items = itemResponses
            )
        }
    }

    @Transactional
    fun claimOrder(orderId: Int, staffUuid: String): List<String> {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found") }

        if (order.orderStatus.statusName != orderStatusEnum.PENDING) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Order has already been claimed or is not pending")
        }

        val staff = userRepository.findById(UUID.fromString(staffUuid))
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found") }

        // Deduct stock item-by-item; items whose stock is insufficient are individually
        // canceled instead of rejecting the whole order.
        val canceledDetails = deductStockPerItem(orderId)
        val remainingDetails = orderDetailRepository.findByOrderId(orderId).filter { !it.isCanceled }

        if (remainingDetails.isEmpty()) {
            // Nothing in the order could be fulfilled; cancel it entirely and refund in full.
            // Runs in its own transaction so the cancellation survives this method's rollback.
            orderCancellationService.cancelDueToInsufficientStock(orderId)
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for all items. Order has been canceled.")
        }

        if (canceledDetails.isNotEmpty()) {
            val refundAmount = canceledDetails.fold(BigDecimal.ZERO) { acc, detail -> acc.add(detail.price) }
            order.totalPrice = order.totalPrice.subtract(refundAmount)
            val itemNames = canceledDetails.joinToString(", ") { it.menuItem.name }
            refundCreditService.creditRefund(order.customer, refundAmount, order, "Order #$orderId: removed due to insufficient stock ($itemNames)")
        }

        val inProgressStatus = orderStatusRepository.findByStatusName(orderStatusEnum.IN_PROGRESS)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "IN_PROGRESS status not found in DB")

        order.staff = staff
        order.orderStatus = inProgressStatus

        // Optimistic locking will throw OptimisticLockException if someone else updated it concurrently
        orderRepository.save(order)

        return canceledDetails.map { it.menuItem.name }
    }

    @Transactional
    fun completeOrder(orderId: Int, staffUuid: String) {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found") }

        if (order.orderStatus.statusName != orderStatusEnum.IN_PROGRESS) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not in progress")
        }

        val staffUuidObj = UUID.fromString(staffUuid)
        if (order.staff?.id != staffUuidObj) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this order")
        }

        val deliveredStatus = orderStatusRepository.findByStatusName(orderStatusEnum.DELIVERED)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "DELIVERED status not found in DB")

        order.orderStatus = deliveredStatus
        orderRepository.save(order)
    }

    @Transactional
    fun cancelOrder(orderId: Int, staffUuid: String) {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found") }

        val currentStatus = order.orderStatus.statusName
        if (currentStatus != orderStatusEnum.PENDING && currentStatus != orderStatusEnum.IN_PROGRESS) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending or in-progress orders can be canceled")
        }

        val staffUuidObj = UUID.fromString(staffUuid)
        val staff = userRepository.findById(staffUuidObj)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found") }

        // Only the assigned staff can cancel an in-progress order
        if (currentStatus == orderStatusEnum.IN_PROGRESS && order.staff?.id != staffUuidObj) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Only the assigned staff can cancel this order")
        }

        // Restore stock if it was already deducted (IN_PROGRESS). Items that were already
        // individually canceled (e.g. due to insufficient stock at claim time) never had
        // stock deducted, so they're excluded here to avoid over-crediting stock.
        if (currentStatus == orderStatusEnum.IN_PROGRESS) {
            restoreStock(orderId)
        }

        val canceledStatus = orderStatusRepository.findByStatusName(orderStatusEnum.CANCELED)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "CANCELED status not found in DB")

        order.orderStatus = canceledStatus
        order.canceledBy = "${staff.firstName ?: ""} ${staff.lastName ?: ""}".trim().ifEmpty { staff.username }
        orderRepository.save(order)

        refundCreditService.creditRefund(order.customer, order.totalPrice, order, "Order #$orderId canceled by staff")
    }

    @Transactional
    fun cancelOrderItem(orderId: Int, detailId: Int, staffUuid: String) {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found") }

        val currentStatus = order.orderStatus.statusName
        if (currentStatus != orderStatusEnum.PENDING && currentStatus != orderStatusEnum.IN_PROGRESS) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending or in-progress orders support canceling individual items")
        }

        // A pending order has no staff assigned yet, so any staff may trim its items.
        // Once claimed (IN_PROGRESS), only the assigned staff may modify it.
        val staffUuidObj = UUID.fromString(staffUuid)
        if (currentStatus == orderStatusEnum.IN_PROGRESS && order.staff?.id != staffUuidObj) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Only the assigned staff can modify this order")
        }

        val detail = orderDetailRepository.findById(detailId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Order item not found") }

        if (detail.order.id != orderId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to this order")
        }
        if (detail.isCanceled) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Item is already canceled")
        }

        val activeDetails = orderDetailRepository.findByOrderId(orderId).filter { !it.isCanceled }
        if (activeDetails.size <= 1) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel the last remaining item; cancel the whole order instead")
        }

        // A pending order's stock hasn't been deducted yet (that happens at claim time),
        // so only restore stock for an item that was already deducted (IN_PROGRESS).
        if (currentStatus == orderStatusEnum.IN_PROGRESS) {
            val requirements = computeStockRequirements(listOf(detail))
            if (requirements.isNotEmpty()) {
                val stocks = stockRepository.findAllById(requirements.keys.toList())
                val stocksMap = stocks.associateBy { it.id }
                for ((stockId, amount) in requirements) {
                    stocksMap[stockId]?.let { it.amount = it.amount.add(amount) }
                }
                stockRepository.saveAll(stocksMap.values)
            }
        }

        detail.isCanceled = true
        orderDetailRepository.save(detail)

        order.totalPrice = order.totalPrice.subtract(detail.price)
        orderRepository.save(order)

        refundCreditService.creditRefund(order.customer, detail.price, order, "Order #$orderId: '${detail.menuItem.name}' canceled by staff")
    }

    private fun computeStockRequirementsPerDetail(details: List<OrderDetail>): Map<Int, Map<Int, BigDecimal>> {
        if (details.isEmpty()) return emptyMap()

        val detailIds = details.map { it.id }
        val allSelections = orderItemSelectionRepository.findByOrderDetailIdIn(detailIds)
        val selectionsByDetailId = allSelections.groupBy { it.orderDetail.id }

        val result = mutableMapOf<Int, Map<Int, BigDecimal>>()
        for (detail in details) {
            val amountMultiplier = BigDecimal(detail.amount)
            val requirement = mutableMapOf<Int, BigDecimal>()

            val recipes = menuRecipeRepository.findByMenuItem_Id(detail.menuItem.id)
            for (recipe in recipes) {
                val stockId = recipe.stock.id
                requirement[stockId] = requirement.getOrDefault(stockId, BigDecimal.ZERO).add(recipe.amount.multiply(amountMultiplier))
            }

            val selections = selectionsByDetailId[detail.id] ?: emptyList()
            if (selections.isNotEmpty()) {
                val choiceIds = selections.map { it.optionChoice.id }
                val ingredients = optionIngredientRepository.findByOptionChoiceIdIn(choiceIds)
                for (ingredient in ingredients) {
                    val stockId = ingredient.stock.id
                    requirement[stockId] = requirement.getOrDefault(stockId, BigDecimal.ZERO).add(ingredient.amount.multiply(amountMultiplier))
                }
            }

            result[detail.id] = requirement
        }
        return result
    }

    /** Aggregate ingredient/stock requirements across all given details, keyed by stock id. */
    private fun computeStockRequirements(details: List<OrderDetail>): Map<Int, BigDecimal> {
        val totals = mutableMapOf<Int, BigDecimal>()
        for (requirement in computeStockRequirementsPerDetail(details).values) {
            for ((stockId, amount) in requirement) {
                totals[stockId] = totals.getOrDefault(stockId, BigDecimal.ZERO).add(amount)
            }
        }
        return totals
    }

    private fun deductStockPerItem(orderId: Int): List<OrderDetail> {
        val details = orderDetailRepository.findByOrderId(orderId).filter { !it.isCanceled }
        if (details.isEmpty()) return emptyList()

        val perDetailRequirements = computeStockRequirementsPerDetail(details)
        val allStockIds = perDetailRequirements.values.flatMap { it.keys }.toSet()
        val stocks = stockRepository.findAllById(allStockIds.toList())
        val stocksMap = stocks.associateBy { it.id }
        val available = stocksMap.mapValues { it.value.amount }.toMutableMap()

        val canceledDetails = mutableListOf<OrderDetail>()
        for (detail in details) {
            val requirement = perDetailRequirements[detail.id] ?: emptyMap()
            val sufficient = requirement.all { (stockId, amount) -> (available[stockId] ?: BigDecimal.ZERO) >= amount }
            if (sufficient) {
                for ((stockId, amount) in requirement) {
                    available[stockId] = available.getValue(stockId).subtract(amount)
                }
            } else {
                detail.isCanceled = true
                canceledDetails.add(detail)
            }
        }

        for ((stockId, remaining) in available) {
            stocksMap[stockId]?.amount = remaining
        }
        stockRepository.saveAll(stocksMap.values)

        if (canceledDetails.isNotEmpty()) {
            orderDetailRepository.saveAll(canceledDetails)
        }

        return canceledDetails
    }

    private fun restoreStock(orderId: Int) {
        val details = orderDetailRepository.findByOrderId(orderId).filter { !it.isCanceled }
        val requirements = computeStockRequirements(details)
        if (requirements.isEmpty()) return

        val stocks = stockRepository.findAllById(requirements.keys.toList())
        val stocksMap = stocks.associateBy { it.id }

        for ((stockId, amount) in requirements) {
            stocksMap[stockId]?.let { it.amount = it.amount.add(amount) }
        }

        stockRepository.saveAll(stocksMap.values)
    }
}