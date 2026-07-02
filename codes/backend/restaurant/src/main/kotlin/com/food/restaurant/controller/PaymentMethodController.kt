package com.food.restaurant.controller

import com.food.restaurant.dto.PaymentMethodResponse
import com.food.restaurant.service.PaymentMethodService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/customer/payments")
class PaymentMethodController(
    private val paymentMethodService: PaymentMethodService
) {

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    fun fetchPaymentMethods(): ResponseEntity<List<PaymentMethodResponse>> {
        val methods = paymentMethodService.getAvailablePaymentMethods()
        return ResponseEntity.ok(methods)
    }
}
