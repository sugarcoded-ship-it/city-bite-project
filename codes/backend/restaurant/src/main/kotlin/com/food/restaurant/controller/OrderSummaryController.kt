package com.food.restaurant.controller

import com.food.restaurant.dto.CartItemRequest
import com.food.restaurant.dto.CartSummaryResponse
import com.food.restaurant.dto.CreateOrderRequest
import com.food.restaurant.entity.order.Order
import com.food.restaurant.service.OrderSummaryService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/customer/orders")
class OrderSummaryController(private val orderService: OrderSummaryService) {

    @PostMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    fun getOrderSummary(@RequestBody requestedItems: List<CartItemRequest>): ResponseEntity<CartSummaryResponse> {

        val summary = orderService.summarizeCartBeforePayment(requestedItems)
        return ResponseEntity.ok(summary)
    }

    @PostMapping("/create")
    fun createOrder(@RequestBody request: CreateOrderRequest): ResponseEntity<Order> {
        val newOrder = orderService.processCheckout(request)
        return ResponseEntity.ok(newOrder)
    }

    @PostMapping("/{orderId}/cancel")
    fun cancelOrder(@PathVariable orderId: Int): ResponseEntity<String> {
        orderService.cancelOrder(orderId)
        return ResponseEntity.ok("Order #$orderId has been successfully canceled and refunded to store credit.")
    }
}