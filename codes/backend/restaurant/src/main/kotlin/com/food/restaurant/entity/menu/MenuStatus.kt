package com.food.restaurant.entity.menu

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "Menu_Status")
class MenuStatus(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Status_ID")
    var id: Int = 0,

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'DEACTIVATED'")
    @Column(name = "name", nullable = false)
    var name: menuStatusEnum = menuStatusEnum.DEACTIVATED
)