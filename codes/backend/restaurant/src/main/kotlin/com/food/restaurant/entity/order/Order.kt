package com.food.restaurant.entity.order

import com.food.restaurant.entity.user.User
import com.food.restaurant.entity.user.Address
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
import java.time.LocalDateTime

@Entity
@Table(name = "Orders")
class Order(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Order_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = true)
    var staff: User? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = true)
    var customer: User? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Address_ID", nullable = true)
    var address: Address? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Order_Status_ID", nullable = true)
    var orderStatus: OrderStatus? = null,

    @Column(name = "total_price", nullable = false)
    var totalPrice: BigDecimal,

    @Column(name = "Created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)