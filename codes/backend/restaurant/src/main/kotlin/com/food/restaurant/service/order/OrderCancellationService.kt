package com.food.restaurant.service.order

import com.food.restaurant.entity.order.orderStatusEnum
import com.food.restaurant.entity.payment.RefundCredit
import com.food.restaurant.repository.order.OrderRepository
import com.food.restaurant.repository.order.OrderStatusRepository
import com.food.restaurant.repository.payment.RefundCreditRepository
import java.math.BigDecimal
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

/**
 * Separated into its own bean so that REQUIRES_NEW propagation works via Spring AOP proxy.
 * Calling a REQUIRES_NEW method within the same class bypasses the proxy.
 */
@Service
class OrderCancellationService(
    private val orderRepository: OrderRepository,
    private val orderStatusRepository: OrderStatusRepository,
    private val refundCreditRepository: RefundCreditRepository
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

        val refundAmount = order.totalPrice
        if (refundAmount > BigDecimal.ZERO) {
            val customer = order.customer
            val wallet = refundCreditRepository.findByCustomer_Id(customer.id)
                ?: RefundCredit(customer = customer, amount = BigDecimal.ZERO)
            wallet.amount = wallet.amount.add(refundAmount)
            refundCreditRepository.save(wallet)
        }
    }
}
