package com.food.restaurant.service.order

import com.food.restaurant.dto.order.OrderDetailItemResponse
import com.food.restaurant.dto.order.OrderHistoryResponse
import com.food.restaurant.repository.order.OrderDetailRepository
import com.food.restaurant.repository.order.OrderItemSelectionRepository
import com.food.restaurant.repository.order.OrderRepository
import com.food.restaurant.service.CartService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
@Transactional(readOnly = true)
class OrderHistoryService(
    private val orderRepository: OrderRepository,
    private val orderDetailRepository: OrderDetailRepository,
    private val orderItemSelectionRepository: OrderItemSelectionRepository,
    private val cartService: CartService
) {

    fun getOrderHistory(userId: String, page: Int, size: Int): Page<OrderHistoryResponse> {
        val userUuid = UUID.fromString(userId)
        val pageable = PageRequest.of(page, size)

        val ordersPage = orderRepository.findByCustomerIdOrderByCreatedAtDesc(userUuid, pageable)

        // Batch-fetch all details for orders on this page
        val orderIds = ordersPage.content.map { it.id }
        val allDetails = if (orderIds.isNotEmpty()) {
            orderDetailRepository.findByOrderIdIn(orderIds)
        } else {
            emptyList()
        }

        // Batch-fetch all selections for these details
        val detailIds = allDetails.map { it.id }
        val allSelections = if (detailIds.isNotEmpty()) {
            orderItemSelectionRepository.findByOrderDetailIdIn(detailIds)
        } else {
            emptyList()
        }

        // Group selections by detail ID for fast lookup
        val selectionsByDetailId = allSelections.groupBy { it.orderDetail.id }

        // Group details by order ID
        val detailsByOrderId = allDetails.groupBy { it.order.id }

        return ordersPage.map { order ->
            val details = detailsByOrderId[order.id] ?: emptyList()
            val address = order.address

            val addressString = listOfNotNull(
                address.addressInfo,
                address.subDistrict,
                address.district,
                address.province,
                address.postalCode
            ).joinToString(", ")

            val itemResponses = details.map { detail ->
                val selections = selectionsByDetailId[detail.id] ?: emptyList()
                OrderDetailItemResponse(
                    menuId = detail.menuItem.id,
                    menuName = detail.menuItem.name,
                    quantity = detail.amount,
                    price = detail.price.toDouble(),
                    specialRequest = detail.specialRequest,
                    selectedChoiceIds = selections.map { it.optionChoice.id }
                )
            }

            OrderHistoryResponse(
                orderId = order.id,
                totalAmount = order.totalPrice.toDouble(),
                createdAt = order.createdAt.toString(),
                status = order.orderStatus.statusName.name,
                canceledBy = order.canceledBy,
                deliveryAddress = addressString,
                items = itemResponses
            )
        }
    }

    @Transactional
    fun reorder(userId: String, orderId: Int) {
        val userUuid = UUID.fromString(userId)
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found") }

        // Verify the order belongs to this customer
        if (order.customer.id != userUuid) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "This order does not belong to you")
        }

        val details = orderDetailRepository.findByOrderId(orderId)
        val detailIds = details.map { it.id }
        val allSelections = if (detailIds.isNotEmpty()) {
            orderItemSelectionRepository.findByOrderDetailIdIn(detailIds)
        } else {
            emptyList()
        }
        val selectionsByDetailId = allSelections.groupBy { it.orderDetail.id }

        // Clear the current cart first, then add only items from this order
        cartService.clearCartForUser(userId)

        for (detail in details) {
            val selections = selectionsByDetailId[detail.id] ?: emptyList()
            val choiceIds = selections.map { it.optionChoice.id }

            // Build the selectedChoices map with a single group key (flattened)
            val selectedChoicesMap: Map<String, List<Int>> = if (choiceIds.isNotEmpty()) {
                mapOf("choices" to choiceIds)
            } else {
                emptyMap()
            }

            cartService.addItem(
                userId = userId,
                menuId = detail.menuItem.id,
                specialRequest = detail.specialRequest,
                selectedChoices = selectedChoicesMap,
                quantity = detail.amount
            )
        }
    }
}
