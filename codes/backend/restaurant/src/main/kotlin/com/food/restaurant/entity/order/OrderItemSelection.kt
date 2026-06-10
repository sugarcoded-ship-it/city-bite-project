package com.food.restaurant.entity.order

import com.food.restaurant.entity.menu.OptionChoice
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "Order_Item_Selections")
class OrderItemSelection(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Selection_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Order_Detail_ID", nullable = false)
    val orderDetail: OrderDetail,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Choice_ID", nullable = false)
    val optionChoice: OptionChoice
)