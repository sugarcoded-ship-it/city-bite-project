package com.food.restaurant.controller

import com.food.restaurant.dto.CreditRequest
import com.food.restaurant.dto.RefundCreditResponse
import com.food.restaurant.service.RefundCreditService
import com.food.restaurant.service.UserSyncService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.util.UUID

@RestController
@RequestMapping("/api/customer/credits")
class RefundCreditController(
    private val refundCreditService: RefundCreditService,
    private val userSyncService: UserSyncService
) {

    /**
     * URL: GET http://localhost:8080/api/credits/balance?keycloakUuid=1234-5678
     * Used by the Home Page to display the user's available refund credits.
     */
    @GetMapping("/balance")
    @PreAuthorize("isAuthenticated()")
    fun getUserBalance(
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<RefundCreditResponse> {

        val balance = refundCreditService.getBalance(UUID.fromString(jwt.subject))
        return ResponseEntity.ok(RefundCreditResponse(balance))
    }

    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    fun addCredit(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: CreditRequest
    ): ResponseEntity<String> {
        val user = userSyncService.syncFromToken(jwt)
        refundCreditService.addCredit(user, request.amount)

        return ResponseEntity.ok("Credit of ${request.amount} have been added successfully.")
    }


    @PostMapping("/use")
    @PreAuthorize("isAuthenticated()")
    fun useCredit(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: CreditRequest
    ): ResponseEntity<String> {
        val user = userSyncService.syncFromToken(jwt)
        val isSuccess = refundCreditService.useCredit(user, request.amount)

        return if (isSuccess) {
            ResponseEntity.ok("Successfully used ${request.amount} from credit balance.")
        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient credit balance")
        }
    }
}