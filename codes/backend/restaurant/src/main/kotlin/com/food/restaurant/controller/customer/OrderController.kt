package com.food.restaurant.controller.customer

import com.food.restaurant.dto.order.OrderHistoryResponse
import com.food.restaurant.service.order.OrderHistoryService
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController("customerOrderController")
@RequestMapping("/api/customer/orders")
class OrderController(
    private val orderHistoryService: OrderHistoryService
) {

    // ── Order History ──

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    fun getOrderHistory(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): Page<OrderHistoryResponse> {
        val userId = jwt.subject
        return orderHistoryService.getOrderHistory(userId, page, size)
    }

    @PostMapping("/reorder/{orderId}")
    @PreAuthorize("isAuthenticated()")
    fun reorderPastOrder(
        @PathVariable orderId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Map<String, String>> {
        val userId = jwt.subject
        orderHistoryService.reorder(userId, orderId)
        return ResponseEntity.ok(mapOf("message" to "Order items added to cart"))
    }
}
