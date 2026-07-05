package com.food.restaurant.service.order

import com.food.restaurant.entity.order.orderStatusEnum
import com.food.restaurant.repository.order.OrderRepository
import com.food.restaurant.repository.order.OrderStatusRepository
import com.food.restaurant.repository.payment.PaymentTransactionRepository
import com.food.restaurant.service.RefundCreditService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class OrderCancellationService(
    private val orderRepository: OrderRepository,
    private val orderStatusRepository: OrderStatusRepository,
    private val paymentTransactionRepository: PaymentTransactionRepository,
    private val refundCreditService: RefundCreditService
) {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun cancelDueToInsufficientStock(orderId: Int) {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found") }
        val canceledStatus = orderStatusRepository.findByStatusName(orderStatusEnum.CANCELED)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "CANCELED status not found in DB")
        order.orderStatus = canceledStatus
        order.canceledBy = "System (Insufficient Stock)"
        orderRepository.save(order)

        val transaction = paymentTransactionRepository.findByOrderId(orderId)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Payment transaction not found for order #$orderId")

        refundCreditService.creditRefund(order.customer, order.totalPrice, transaction, order, "Order #$orderId auto-canceled: insufficient stock for all items")
    }
}