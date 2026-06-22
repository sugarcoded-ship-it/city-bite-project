package com.food.restaurant.entity.cart

import com.food.restaurant.entity.menu.MenuItem
import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "cart_items")
class CartItem(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    val id: Int = 0,

    @Column(name = "customer_uuid", nullable = false)
    val customerUuid: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    val menuItem: MenuItem,

    @Column(name = "quantity", nullable = false)
    var quantity: Int,

    @Column(name = "special_request")
    var specialRequest: String? = null,

    @OneToMany(mappedBy = "cartItem", cascade = [CascadeType.ALL], orphanRemoval = true)
    val selections: MutableList<CartItemSelection> = mutableListOf()
)
