package com.food.restaurant.entity.stock

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated

@Entity
@Table(name = "Stocks_Category")
class StockCategory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Stock_Category_ID")
    var id: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false)
    var name: StockCategoryEnum
)
