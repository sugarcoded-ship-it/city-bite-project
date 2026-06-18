package com.food.restaurant.entity.menu

import jakarta.persistence.*

@Entity
@Table(name = "Cart_Items")
class CartItem(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val cartItemId: Int = 0,

    @Column(name = "User_ID")
    val userId: String,

    @ManyToOne
    @JoinColumn(name = "Menu_ID")
    val menuItem: MenuItem,

    var quantity: Int = 1
)