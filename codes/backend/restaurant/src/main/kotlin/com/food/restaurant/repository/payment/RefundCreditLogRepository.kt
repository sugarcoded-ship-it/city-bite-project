package com.food.restaurant.repository.payment

import com.food.restaurant.entity.payment.RefundCreditLog
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RefundCreditLogRepository : JpaRepository<RefundCreditLog, Int> {
    fun findByCustomer_IdOrderByCreatedAtDesc(customerUuid: UUID, pageable: Pageable): Page<RefundCreditLog>
}