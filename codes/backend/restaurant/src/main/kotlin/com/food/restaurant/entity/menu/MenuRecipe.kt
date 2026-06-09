package com.food.restaurant.entity.menu

import com.food.restaurant.entity.stock.Stock
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
@Table(name = "Menu_Recipe")
class MenuRecipe(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Recipe_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Menu_ID", nullable = true)
    var menuItem: MenuItem? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Stock_ID", nullable = true)
    var stock: Stock? = null,

    @Column(name = "amount", nullable = true)
    var amount: BigDecimal? = null,

    @Column(name = "measure_unit", nullable = true)
    var measureUnit: String? = null
)