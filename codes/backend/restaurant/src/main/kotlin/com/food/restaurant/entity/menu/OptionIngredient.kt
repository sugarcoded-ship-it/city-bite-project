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
@Table(name = "Option_Ingredients")
class OptionIngredient(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Option_Recipe_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Choice_ID", nullable = true)
    var optionChoice: OptionChoice? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Stock_ID", nullable = true)
    var stock: Stock? = null,

    @Column(name = "amount", nullable = true)
    var amount: BigDecimal? = null,

    @Column(name = "measure_unit", nullable = true)
    var measureUnit: String? = null
)