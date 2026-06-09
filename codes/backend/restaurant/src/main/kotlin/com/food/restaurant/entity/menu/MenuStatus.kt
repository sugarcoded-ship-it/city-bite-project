package com.food.restaurant.entity.menu

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "Menu_Status")
class MenuStatus(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Status_ID")
    val id: Int = 0,

    @Column(name = "name", nullable = false)
    var name: String
)