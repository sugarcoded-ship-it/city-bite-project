package com.food.restaurant.entity.order

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
@Table(name = "Order_Status")
class OrderStatus(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Order_Status_ID")
    var id: Int = 0,

    @Enumerated(EnumType.STRING)
    @ColumnDefault("PENDING")
    @Column(name = "Status_Name", nullable = false)
    var statusName: orderStatusEnum = orderStatusEnum.PENDING
)