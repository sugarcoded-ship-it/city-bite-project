package com.food.restaurant.controller.staff

import com.food.restaurant.dto.order.StaffOrderResponse
import com.food.restaurant.service.order.StaffOrderService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController("staffOrderController")
@RequestMapping("/api/staff/orders")
class OrderController(
    private val staffOrderService: StaffOrderService
) {

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    fun getActiveOrders(): ResponseEntity<List<StaffOrderResponse>> {
        val orders = staffOrderService.getActiveOrders()
        return ResponseEntity.ok(orders)
    }

    @PostMapping("/{orderId}/claim")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    fun claimOrder(
        @PathVariable orderId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Map<String, String>> {
        val staffUuid = jwt.subject
        staffOrderService.claimOrder(orderId, staffUuid)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to "Order successfully claimed"))
    }

    @PostMapping("/{orderId}/complete")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    fun completeOrder(
        @PathVariable orderId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Map<String, String>> {
        val staffUuid = jwt.subject
        staffOrderService.completeOrder(orderId, staffUuid)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to "Order completed"))
    }

    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    fun cancelOrder(
        @PathVariable orderId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Map<String, String>> {
        val staffUuid = jwt.subject
        staffOrderService.cancelOrder(orderId, staffUuid)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to "Order canceled"))
    }
}
