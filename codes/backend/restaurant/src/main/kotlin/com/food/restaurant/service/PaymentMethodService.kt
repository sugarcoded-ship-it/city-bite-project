package com.food.restaurant.service

import com.food.restaurant.dto.PaymentMethodResponse
import com.food.restaurant.repository.payment.PaymentMethodRepository
import org.springframework.stereotype.Service

@Service
class PaymentMethodService(
    private val paymentMethodRepository: PaymentMethodRepository
) {

    fun getAvailablePaymentMethods(): List<PaymentMethodResponse> {
        val entities = paymentMethodRepository.findAll()

        return entities.map {entity ->
            PaymentMethodResponse(
                id = entity.id,
                methodCode = entity.methodName.name
            )
        }
    }
}
