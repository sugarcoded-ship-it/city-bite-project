package com.food.restaurant.entity.user

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.MapsId
import jakarta.persistence.OneToOne
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

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId // Tells Hibernate to use the User's ID as the Staff's ID
    @JoinColumn(name = "keycloak_uuid")
    val user: User,

    @Column(nullable = false)
    var salary: Int,

    @ColumnDefault("100")
    @Column(nullable = false)
    var dayOffAmount: Int = 100,

    @Column(nullable = true)
    var address: String? = null,

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'INACTIVE'")
    @Column(nullable = false)
    var status: StaffStatus = StaffStatus.INACTIVE,
)