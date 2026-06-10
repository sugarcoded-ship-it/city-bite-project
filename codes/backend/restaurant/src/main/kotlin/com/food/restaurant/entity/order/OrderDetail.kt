package com.food.restaurant.entity.order

import com.food.restaurant.entity.menu.MenuItem
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
@Table(name = "Order_Detail")
class OrderDetail(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Order_Detail_ID")
    var id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Order_ID", nullable = false)
    var order: Order,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Menu_ID", nullable = false)
    var menuItem: MenuItem,

    @Column(name = "amount", nullable = false)
    var amount: Int,

    @Column(name = "special_request", nullable = true)
    var specialRequest: String? = null,

    @Column(name = "price", nullable = false)
    var price: BigDecimal
)