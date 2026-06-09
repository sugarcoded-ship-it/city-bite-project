package com.food.restaurant.entity.order

import com.food.restaurant.entity.payment.PaymentTransaction
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "Order_History_Log")
class OrderHistoryLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Order_History_Log_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Order_ID", nullable = true)
    var order: Order? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Payment_Transaction_ID", nullable = true)
    var paymentTransaction: PaymentTransaction? = null,

    @Column(name = "purchased_at", nullable = true)
    var purchasedAt: LocalDateTime? = null,

    @Column(name = "received_at", nullable = true)
    var receivedAt: LocalDateTime? = null
)