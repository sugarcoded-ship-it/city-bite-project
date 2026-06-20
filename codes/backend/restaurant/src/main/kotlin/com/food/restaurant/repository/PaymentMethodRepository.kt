package com.food.restaurant.repository

import com.food.restaurant.entity.payment.PaymentMethod
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PaymentMethodRepository : JpaRepository<PaymentMethod, Int> {
}