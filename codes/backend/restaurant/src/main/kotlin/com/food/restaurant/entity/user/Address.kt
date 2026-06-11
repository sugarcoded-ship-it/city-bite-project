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
    var id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = false)
    var customer: User,

    @Column(name = "address_info", nullable = true)
    var addressInfo: String? = null,

    @Column(name = "district", nullable = false)
    var district: String,

    @Column(name = "sub_district", nullable = false)
    var subDistrict: String,

    @Column(name = "province", nullable = false)
    var province: String,

    @Column(name = "postalCode", nullable = false)
    var postalCode: String
)