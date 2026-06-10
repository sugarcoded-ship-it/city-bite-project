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
@Table(name = "Refund_Credit")
class RefundCredit(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Credit_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = false)
    val customer: User,

    @Column(name = "Amount", nullable = false)
    var amount: BigDecimal = BigDecimal.ZERO
)