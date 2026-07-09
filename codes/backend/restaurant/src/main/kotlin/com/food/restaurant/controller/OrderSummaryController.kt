package com.food.restaurant.controller

import com.food.restaurant.dto.order.CartItemRequest
import com.food.restaurant.dto.order.CartSummaryResponse
import com.food.restaurant.dto.order.CreateOrderRequest
import com.food.restaurant.dto.EtaResponse
import com.food.restaurant.service.OrderETAService
import com.food.restaurant.service.OrderSummaryService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/customer/orders")
class OrderSummaryController(
    private val orderService: OrderSummaryService,
    private val orderETAService: OrderETAService
) {

    @PostMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    fun getOrderSummary(@RequestBody requestedItems: List<CartItemRequest>): ResponseEntity<CartSummaryResponse> {

        val summary = orderService.summarizeCartBeforePayment(requestedItems)
        return ResponseEntity.ok(summary)
    }

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    fun createOrder(@RequestBody request: CreateOrderRequest): ResponseEntity<Map<String, Any>> {
        val newOrder = orderService.processCheckout(request)
        return ResponseEntity.ok(
            mapOf(
                "orderId" to newOrder.id,
                "totalPrice" to newOrder.totalPrice,
                "status" to "PENDING"
            )
        )
    }

    @GetMapping("/{orderId}/eta")
    @PreAuthorize("isAuthenticated()")
    fun getOrderEta(
        @PathVariable orderId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<EtaResponse> {
        val eta = orderETAService.getEta(orderId, UUID.fromString(jwt.subject))
        return ResponseEntity.ok(eta)
    }

    @PostMapping("/{orderId}/cancel")
    fun cancelOrder(@PathVariable orderId: Int): ResponseEntity<String> {
        orderService.cancelOrder(orderId)
        return ResponseEntity.ok("Order #$orderId has been successfully canceled and refunded to store credit.")
    }
}