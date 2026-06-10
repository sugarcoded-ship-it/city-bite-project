package com.food.restaurant.entity.payment

import com.food.restaurant.entity.user.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal

@Entity
@Table(name = "Refund_Credit_Log")
class RefundCreditLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Refund_Log_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Payment_Transaction_ID", nullable = false)
    val paymentTransaction: PaymentTransaction,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Customer_User_ID", nullable = false)
    val customer: User,

    @Column(name = "Amount", nullable = false)
    val amount: BigDecimal
)