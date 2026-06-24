package com.food.restaurant.repository.payment

import com.food.restaurant.entity.order.Order
import com.food.restaurant.entity.payment.PaymentTransaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PaymentTransactionRepository : JpaRepository<PaymentTransaction, Int> {
    fun findByOrderId(orderId: Int): PaymentTransaction
    fun order(order: Order): MutableList<PaymentTransaction>
}