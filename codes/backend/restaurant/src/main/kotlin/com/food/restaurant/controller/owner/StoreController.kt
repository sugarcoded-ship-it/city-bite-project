package com.food.restaurant.controller.owner

import com.food.restaurant.dto.store.StoreDetailRequest
import com.food.restaurant.dto.store.StoreDetailResponse
import com.food.restaurant.dto.store.StoreStatusRequest
import com.food.restaurant.dto.store.StoreStatusResponse
import com.food.restaurant.service.StoreService
import com.food.restaurant.service.UserSyncService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController("storeController")
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('ROLE_OWNER')")
class   StoreController(
    private val storeService: StoreService,
    private val userSyncService: UserSyncService
) {
    @GetMapping("/store/status")
    fun getStoreStatus(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<StoreStatusResponse> {
        val ownerUuid = UUID.fromString(jwt.subject)
        val store = storeService.getStore(ownerUuid)
        return if (store != null) {
            ResponseEntity.ok(StoreStatusResponse(store.isOpen, store.storeName, store.storeAddress))
        } else {
            // 204 as no content to return
            ResponseEntity.noContent().build()
        }
    }

    @PutMapping("/store/status")
    fun updateStoreStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: StoreStatusRequest
    ): ResponseEntity<StoreStatusResponse> {
        val ownerUuid = UUID.fromString(jwt.subject)
        val res = storeService.updateStoreStatus(ownerUuid, request)
        return if (res != null) {
            ResponseEntity.ok(res)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }

    @GetMapping("/store/detail")
    fun getStoreDetail(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<StoreDetailResponse> {
        val ownerUuid = UUID.fromString(jwt.subject)
        val res = storeService.getStoreDetail(ownerUuid)
        return if (res != null) {
            ResponseEntity.ok(res)
        } else {
            ResponseEntity.noContent().build()
        }
    }

    @PostMapping("/store/detail")
    fun createStoreDetail(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: StoreDetailRequest
    ): ResponseEntity<StoreDetailResponse> {
        val ownerUuid = UUID.fromString(jwt.subject)
        val res = storeService.createStoreDetail(ownerUuid, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(res)
    }

    @PutMapping("/store/detail")
    fun updateStoreDetail(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: StoreDetailRequest
    ): ResponseEntity<StoreDetailResponse> {
        val ownerUuid = UUID.fromString(jwt.subject)
        val res = storeService.updateStoreDetail(ownerUuid, request)
        return ResponseEntity.ok(res)
    }
}