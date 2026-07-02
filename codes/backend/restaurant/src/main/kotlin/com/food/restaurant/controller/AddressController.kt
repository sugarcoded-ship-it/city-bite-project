package com.food.restaurant.controller

import com.food.restaurant.dto.AddressRequest
import com.food.restaurant.dto.AddressResponse
import com.food.restaurant.service.AddressService
import com.food.restaurant.service.UserSyncService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/customer/addresses")
class AddressController(
    private val addressService: AddressService
) {

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    fun getCustomerAddresses(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<List<AddressResponse>> {
        val addresses = addressService.getCustomerAddresses(UUID.fromString(jwt.subject))
        return ResponseEntity.ok(addresses)
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    fun createAddress(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: AddressRequest
    ): ResponseEntity<AddressResponse> {
        val newAddress = addressService.addNewAddress(UUID.fromString(jwt.subject), request)
        return ResponseEntity.ok(newAddress)
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    fun editAddress(
        @PathVariable addressId: Int,
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: AddressRequest
    ): ResponseEntity<AddressResponse> {
        val updatedAddr = addressService.editAddress(UUID.fromString(jwt.subject), addressId, request)
        return ResponseEntity.ok(updatedAddr)
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    fun deleteAddress(
        @PathVariable addressId: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Void> {
        addressService.deleteAddress(UUID.fromString(jwt.subject), addressId)
        return ResponseEntity.noContent().build()
    }
}