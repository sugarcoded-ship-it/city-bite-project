package com.food.restaurant.entity.payment

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "Payment_method")
class PaymentMethod(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Method_ID")
    var id: Int = 0,

    @Enumerated(EnumType.STRING)
    @ColumnDefault("CASH_ON_DELIVERY")
    @Column(name = "method_name", nullable = false)
    var methodName: paymentMethodEnum = paymentMethodEnum.CASH_ON_DELIVERY
)