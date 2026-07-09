package com.food.restaurant.controller.staff

import com.food.restaurant.dto.order.StaffOrderResponse
import com.food.restaurant.service.order.StaffOrderService
import com.food.restaurant.service.user.StaffService
import java.util.UUID
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
    private val staffOrderService: StaffOrderService,
    private val staffService: StaffService
) {

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    fun getActiveOrders(
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<List<StaffOrderResponse>> {
        if (staffService.isInactive(UUID.fromString(jwt.subject))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        val orders = staffOrderService.getActiveOrders()
        return ResponseEntity.ok(orders)
    }

    @PostMapping("/{orderId}/claim")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    fun claimOrder(
        @PathVariable orderId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Map<String, Any>> {
        val staffUuid = jwt.subject
        val removedItems = staffOrderService.claimOrder(orderId, staffUuid)
        val message = if (removedItems.isEmpty()) {
            "Order successfully claimed"
        } else {
            "Order claimed. Removed due to insufficient stock: ${removedItems.joinToString(", ")}"
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to message, "removedItems" to removedItems))
    }

    @PostMapping("/{orderId}/items/{detailId}/cancel")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    fun cancelOrderItem(
        @PathVariable orderId: Int,
        @PathVariable detailId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Map<String, String>> {
        val staffUuid = jwt.subject
        staffOrderService.cancelOrderItem(orderId, detailId, staffUuid)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to "Item canceled and refunded"))
    }

    @PostMapping("/{orderId}/deliver")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    fun deliverOrder(
        @PathVariable orderId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Map<String, String>> {
        val staffUuid = jwt.subject
        staffOrderService.deliverOrder(orderId, staffUuid)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to "Order is now out for delivery"))
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
