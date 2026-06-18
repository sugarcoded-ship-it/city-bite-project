package com.food.restaurant.entity.user

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.validation.constraints.Email
import org.hibernate.annotations.ColumnDefault
import java.util.UUID

@Entity
@Table(name = "staffs")
class Staff(
    @Id
    @Column(name = "keycloak_uuid")
    val id: UUID,

    @Column(nullable = false)
    var salary: Int,

    @ColumnDefault("100")
    @Column(nullable = false)
    var dayOffAmount: Int = 100,

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'DEACTIVATED'")
    @Column(nullable = false)
    var status: StaffStatus = StaffStatus.DEACTIVATED,
)