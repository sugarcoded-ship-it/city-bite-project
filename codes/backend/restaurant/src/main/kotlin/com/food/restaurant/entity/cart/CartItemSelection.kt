package com.food.restaurant.entity.cart

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
@Table(name = "cart_item_selections")
class CartItemSelection(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "selection_id")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_item_id", nullable = false)
    val cartItem: CartItem,

    @Column(name = "choice_id", nullable = false)
    val choiceId: Int
)