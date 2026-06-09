package com.food.restaurant.entity.user

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
@Table(name = "Address")
class Address(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Address_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = true)
    var customer: User? = null,

    @Column(name = "address_info", nullable = true)
    var addressInfo: String? = null,

    @Column(name = "district", nullable = true)
    var district: String? = null,

    @Column(name = "sub_district", nullable = true)
    var subDistrict: String? = null,

    @Column(name = "province", nullable = true)
    var province: String? = null,

    @Column(name = "postalCode", nullable = true)
    var postalCode: String? = null
)