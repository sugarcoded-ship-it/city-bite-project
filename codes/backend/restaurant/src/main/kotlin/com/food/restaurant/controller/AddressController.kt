package com.food.restaurant.controller

import com.food.restaurant.DTO.AddressRequest
import com.food.restaurant.DTO.AddressResponse
import com.food.restaurant.service.AddressService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/addresses")
class AddressController(
    private val addressService: AddressService
) {

    @GetMapping
    fun getCustomerAddresses(@RequestParam customerId: UUID): ResponseEntity<List<AddressResponse>> {
        val addresses = addressService.getCustomerAddresses(customerId)
        return ResponseEntity.ok(addresses)
    }

    @PostMapping
    fun createAddress(
        @RequestParam customerId: UUID,
        @RequestBody request: AddressRequest
    ): ResponseEntity<AddressResponse> {
        val newAddress = addressService.addNewAddress(customerId, request)
        return ResponseEntity.ok(newAddress)
    }
}