package com.food.restaurant.entity.payment

import com.food.restaurant.entity.order.Order
import com.food.restaurant.entity.user.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "Refund_Credit_Log")
class RefundCreditLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Refund_Log_ID")
    var id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = false)
    var customer: User,

    @Column(name = "Amount", nullable = false)
    val amount: BigDecimal,

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    val type: RefundCreditLogType,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Order_ID", nullable = true)
    var order: Order? = null,

    @Column(name = "description", nullable = true)
    var description: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)