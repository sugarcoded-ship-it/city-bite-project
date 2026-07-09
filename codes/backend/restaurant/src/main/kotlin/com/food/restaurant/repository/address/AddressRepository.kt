package com.food.restaurant.repository.address

import com.food.restaurant.entity.address.Address
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AddressRepository: JpaRepository<Address, Int> {
    fun findByCustomer_Id(customerUuid: UUID): List<Address>

    fun countByCustomer_Id(customerUuid: UUID): Long

    fun findByCustomer_IdAndActiveTrue(customerUuid: UUID): List<Address>

    fun countByCustomer_IdAndActiveTrue(customerUuid: UUID): Long
}