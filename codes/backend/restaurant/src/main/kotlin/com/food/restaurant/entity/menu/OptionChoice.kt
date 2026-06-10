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
@Table(name = "Option_Choices")
class OptionChoice(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Choice_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Group_ID", nullable = false)
    val optionGroup: OptionGroup,

    @Column(name = "Choice_Name", nullable = false)
    var choiceName: String,

    @Column(name = "Extra_Price", nullable = false)
    var extraPrice: BigDecimal = BigDecimal.ZERO
)