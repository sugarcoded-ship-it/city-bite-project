package com.food.restaurant.entity.payment

import com.food.restaurant.entity.store.Store
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "Financial_Record")
class FinancialRecord(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Record_ID")
    var id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Store_ID", nullable = false)
    var store: Store,

    @Column(name = "Update_At", nullable = false)
    var updateAt: LocalDateTime = LocalDateTime.now().plusHours(7)
)