package com.food.restaurant.repository

import com.food.restaurant.entity.user.Address
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AddressRepository: JpaRepository<Address, Int> {
    fun findByCustomer_Id(customerUuid: UUID): List<Address>

    fun countByCustomer_Id(customerUuid: UUID): Long
}