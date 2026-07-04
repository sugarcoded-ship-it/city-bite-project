package com.food.restaurant.service.order

import com.food.restaurant.dto.order.StaffOrderItemResponse
import com.food.restaurant.dto.order.StaffOrderResponse
import com.food.restaurant.entity.order.orderStatusEnum
import com.food.restaurant.repository.menu.MenuRecipeRepository
import com.food.restaurant.repository.OptionIngredientRepository
import com.food.restaurant.repository.order.OrderRepository
import com.food.restaurant.repository.stock.StockRepository
import com.food.restaurant.repository.user.UserRepository
import com.food.restaurant.repository.order.OrderDetailRepository
import com.food.restaurant.repository.order.OrderItemSelectionRepository
import com.food.restaurant.repository.order.OrderStatusRepository
import com.food.restaurant.entity.payment.RefundCredit
import com.food.restaurant.repository.payment.RefundCreditRepository
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
    private val refundCreditRepository: RefundCreditRepository

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
                    menuName = detail.menuItem.name,
                    quantity = detail.amount,
                    price = detail.price.toDouble(),
                    specialRequest = detail.specialRequest,
                    selectedOptions = selections.map { it.optionChoice.choiceName }
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
    fun claimOrder(orderId: Int, staffUuid: String) {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found") }

        if (order.orderStatus.statusName != orderStatusEnum.PENDING) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Order has already been claimed or is not pending")
        }

        val staff = userRepository.findById(UUID.fromString(staffUuid))
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found") }

        // Attempt stock deduction. If it fails, cancel the order.
        try {
            validateAndDeductStock(orderId)
        } catch (e: Exception) {
            // Cancel in a separate transaction so the cancel is committed
            // even though this method throws an exception (which rolls back its own txn)
            orderCancellationService.cancelDueToInsufficientStock(orderId)
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock: ${e.message}. Order has been canceled.")
        }

        val inProgressStatus = orderStatusRepository.findByStatusName(orderStatusEnum.IN_PROGRESS)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "IN_PROGRESS status not found in DB")

        order.staff = staff
        order.orderStatus = inProgressStatus
        
        // Optimistic locking will throw OptimisticLockException if someone else updated it concurrently
        orderRepository.save(order)
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

        if (order.orderStatus.statusName != orderStatusEnum.PENDING) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending orders can be canceled")
        }

        val staff = userRepository.findById(UUID.fromString(staffUuid))
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found") }

        val canceledStatus = orderStatusRepository.findByStatusName(orderStatusEnum.CANCELED)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "CANCELED status not found in DB")

        order.orderStatus = canceledStatus
        order.canceledBy = "${staff.firstName ?: ""} ${staff.lastName ?: ""}".trim().ifEmpty { staff.username }
        orderRepository.save(order)

        val customer = order.customer
        val refundAmount = order.totalPrice
        val wallet = refundCreditRepository.findByCustomer_Id(customer.id)
            ?: RefundCredit(customer = customer, amount = BigDecimal.ZERO)
        wallet.amount = wallet.amount.add(refundAmount)
        refundCreditRepository.save(wallet)
    }

    private fun validateAndDeductStock(orderId: Int) {
        val details = orderDetailRepository.findByOrderId(orderId)
        if (details.isEmpty()) return

        val detailIds = details.map { it.id }
        val allSelections = orderItemSelectionRepository.findByOrderDetailIdIn(detailIds)
        val selectionsByDetailId = allSelections.groupBy { it.orderDetail.id }

        // Map of Stock ID to total amount needed
        val stockRequirements = mutableMapOf<Int, java.math.BigDecimal>()

        for (detail in details) {
            val amountMultiplier = java.math.BigDecimal(detail.amount)
            
            // Menu recipes
            val recipes = menuRecipeRepository.findByMenuItem_Id(detail.menuItem.id)
            for (recipe in recipes) {
                val stockId = recipe.stock.id
                val requiredAmount = recipe.amount.multiply(amountMultiplier)
                stockRequirements[stockId] = stockRequirements.getOrDefault(stockId, java.math.BigDecimal.ZERO).add(requiredAmount)
            }

            // Option ingredients
            val selections = selectionsByDetailId[detail.id] ?: emptyList()
            if (selections.isNotEmpty()) {
                val choiceIds = selections.map { it.optionChoice.id }
                val ingredients = optionIngredientRepository.findByOptionChoiceIdIn(choiceIds)
                for (ingredient in ingredients) {
                    val stockId = ingredient.stock.id
                    val requiredAmount = ingredient.amount.multiply(amountMultiplier)
                    stockRequirements[stockId] = stockRequirements.getOrDefault(stockId, java.math.BigDecimal.ZERO).add(requiredAmount)
                }
            }
        }

        // Validate all and deduct
        val stockIds = stockRequirements.keys.toList()
        val stocks = stockRepository.findAllById(stockIds)
        val stocksMap = stocks.associateBy { it.id }

        for ((stockId, requiredAmount) in stockRequirements) {
            val stock = stocksMap[stockId] ?: throw Exception("Stock item $stockId not found")
            if (stock.amount < requiredAmount) {
                throw Exception("Not enough ${stock.name} (Requires $requiredAmount ${stock.measureUnit}, has ${stock.amount})")
            }
            stock.amount = stock.amount.subtract(requiredAmount)
        }

        stockRepository.saveAll(stocks)
    }
}
