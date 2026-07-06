package com.food.restaurant.entity.user

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.Email
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Id
    @Column(name = "keycloak_uuid")
    val id: UUID,

    @Column(nullable = false, unique = true)
    var username: String,

    @Email
    @Column(nullable = false, unique = true)
    var email: String,

    @Column(name = "first_name")
    var firstName: String? = null,

    @Column(name = "last_name")
    var lastName: String? = null,

    @Column(name = "phone_number")
    var phoneNumber: String? = null,

    @OneToOne(mappedBy = "user", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var staff: Staff? = null,

    @Column(name = "profile_pic")
    var profilePic: String? = null

)