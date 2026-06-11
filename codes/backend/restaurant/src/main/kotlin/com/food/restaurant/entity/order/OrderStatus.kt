package com.food.restaurant.entity.order

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "Order_Status")
class OrderStatus(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Order_Status_ID")
    var id: Int = 0,

    @Column(name = "Status_Name", nullable = false)
    var statusName: String
)