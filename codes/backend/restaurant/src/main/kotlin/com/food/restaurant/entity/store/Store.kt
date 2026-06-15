package com.food.restaurant.entity.store

import com.food.restaurant.entity.user.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.time.LocalTime

@Entity
@Table(name = "Store")
class Store (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Store_ID")
    var id: Int = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = false, unique = true)
    var owner: User,

    @Column(name = "store_name", nullable = false)
    var storeName: String,

    @Column(name = "store_address", nullable = false)
    var storeAddress: String,

    @Column(name = "phone", nullable = false)
    val phone: String,

    @Column(name = "city", nullable = false)
    var city: String,

    @Column(name = "postal_code", nullable = false)
    var postalCode: String,

    @Column(name = "open_time", nullable = false)
    var openTime: LocalTime,

    @Column(name = "close_time", nullable = false)
    var closeTime: LocalTime,

    @Column(name = "is_open", nullable = false)
    var isOpen: Boolean = false
)