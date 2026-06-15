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
import java.sql.Timestamp
import java.time.LocalDate

@Entity
@Table(name = "Leave_Day")
class LeaveDay(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Schedule_ID")
    var id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = false)
    var staff: User,

    @Column(name = "startDate", nullable = false)
    var startDate: LocalDate,

    @Column(name = "endDate", nullable = false)
    var endDate: LocalDate,

    @Column(name = "createdAt", nullable = false)
    var date: Timestamp,

    @Column(name = "status", nullable = false)
    var status: String
)