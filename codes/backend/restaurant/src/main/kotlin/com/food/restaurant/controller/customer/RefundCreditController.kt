package com.food.restaurant.controller.customer

import com.food.restaurant.dto.payment.CreditHistoryEntryResponse
import com.food.restaurant.dto.payment.RefundCreditResponse
import com.food.restaurant.service.payment.RefundCreditService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/customer/credits")
class RefundCreditController(
    private val refundCreditService: RefundCreditService
) {

    @GetMapping("/balance")
    @PreAuthorize("isAuthenticated()")
    fun getUserBalance(
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<RefundCreditResponse> {

        val balance = refundCreditService.getBalance(UUID.fromString(jwt.subject))
        return ResponseEntity.ok(RefundCreditResponse(balance))
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    fun getCreditHistory(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Page<CreditHistoryEntryResponse>> {
        val pageable = PageRequest.of(page, size)
        val historyPage = refundCreditService.getHistory(UUID.fromString(jwt.subject), pageable)
            .map { log ->
                CreditHistoryEntryResponse(
                    type = log.type.name,
                    amount = log.amount,
                    orderId = log.order?.id,
                    description = log.description,
                    createdAt = log.createdAt.toString()
                )
            }
        return ResponseEntity.ok(historyPage)
    }
}