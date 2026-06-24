package com.food.restaurant.repository.payment

import com.food.restaurant.entity.payment.RefundCreditLog
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RefundCreditLogRepository : JpaRepository<RefundCreditLog, Int>