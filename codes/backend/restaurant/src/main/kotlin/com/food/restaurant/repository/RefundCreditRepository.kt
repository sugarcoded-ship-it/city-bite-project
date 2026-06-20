package com.food.restaurant.repository

import com.food.restaurant.entity.payment.RefundCredit
import com.food.restaurant.entity.user.Address
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RefundCreditRepository : JpaRepository<RefundCredit, Int> {
    fun findByCustomer_Id(customerUuid: UUID): RefundCredit
}