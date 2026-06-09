package com.food.restaurant.entity.store

import com.food.restaurant.entity.user.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.time.LocalTime

@Entity
@Table(name = "Store")
class Store (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Store_ID")
    val id: Int = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = true)
    var owner: User? = null,

    @Column(name = "store_name", nullable = false)
    var storeName: String,

    @Column(name = "store_address", nullable = true)
    var storeAddress: String? = null,

    @Column(name = "logo_url", nullable = true)
    var logoUrl: String? = null,

    @Column(name = "phone", nullable = true)
    var phone: String? = null,

    @Column(name = "city", nullable = true)
    var city: String? = null,

    @Column(name = "postal_code", nullable = true)
    var postalCode: String? = null,

    @Column(name = "open_time", nullable = true)
    var openTime: LocalTime? = null,

    @Column(name = "close_time", nullable = true)
    var closeTime: LocalTime? = null,

    @Column(name = "is_open", nullable = false)
    var isOpen: Boolean = false
)