package com.food.restaurant.repository.payment

import com.food.restaurant.entity.payment.RefundCredit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface RefundCreditRepository : JpaRepository<RefundCredit, Int> {
    fun findByCustomer_Id(customerUuid: UUID): RefundCredit?
}