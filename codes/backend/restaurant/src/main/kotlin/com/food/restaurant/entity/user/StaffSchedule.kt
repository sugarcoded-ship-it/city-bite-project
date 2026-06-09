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
import java.time.LocalDate
import java.time.LocalTime

@Entity
@Table(name = "Staff_Schedule")
class StaffSchedule(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Schedule_ID")
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_uuid", nullable = true)
    var staff: User? = null,

    @Column(name = "Date", nullable = false)
    var date: LocalDate,

    @Column(name = "start_time", nullable = true)
    var startTime: LocalTime? = null,

    @Column(name = "end_time", nullable = true)
    var endTime: LocalTime? = null,

    @Column(name = "status", nullable = true)
    var status: String? = null
)