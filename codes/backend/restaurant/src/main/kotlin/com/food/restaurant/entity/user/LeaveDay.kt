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
@Table(name = "leave_day")
class LeaveDay(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_day_id")
    var id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = false)
    var staff: User,

    @Column(name = "start_date", nullable = false) // snake_case
    var startDate: LocalDate,

    @Column(name = "end_date", nullable = false) // snake_case
    var endDate: LocalDate,

    @Column(name = "created_at", nullable = false) // snake_case
    var date: Timestamp,

    @Column(name = "status", nullable = false)
    var status: String
)