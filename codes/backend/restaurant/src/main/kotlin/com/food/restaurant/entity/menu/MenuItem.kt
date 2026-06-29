package com.food.restaurant.entity.menu

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
@Table(name = "Menu_Items")
class MenuItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Menu_ID")
    var id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Category_ID", nullable = false)
    var category: MenuCategory,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Status_ID", nullable = false)
    var status: MenuStatus,

    @Column(name = "name", nullable = false)
    var name: String,

    @Column(name = "price", nullable = false)
    var price: BigDecimal,

    @Column(name = "menu_pic", nullable = true)
    var menu_pic: String? = null,

    @Column(name = "description", nullable = true)
    var description: String? = null
)