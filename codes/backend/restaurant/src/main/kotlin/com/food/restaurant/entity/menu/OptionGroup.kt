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

@Entity
@Table(name = "Option_Groups")
class OptionGroup(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Group_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Menu_ID", nullable = true)
    var menuItem: MenuItem? = null,

    @Column(name = "Group_Name", nullable = false)
    var groupName: String,

    @Column(name = "is_required", nullable = false)
    var isRequired: Boolean = false,

    @Column(name = "Max_Choices", nullable = false)
    var maxChoices: Int = 1
)