package com.food.restaurant.controller.store

import com.food.restaurant.service.StoreService
import com.food.restaurant.service.UserSyncService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController("storeController")
@RequestMapping("/api")
class StoreController(
    private val storeService: StoreService,
    private val userSyncService: UserSyncService
) {

    @GetMapping("/store/status")
    @PreAuthorize("isAuthenticated()")
    fun getStoreStatus(@AuthenticationPrincipal jwt: Jwt): StoreStatusResponse {
        val store = storeService.findGlobalStore()
        return if (store != null) {
            StoreStatusResponse(store.isOpen, store.storeName, store.storeAddress)
        } else {
            // Default: store is open if no store record exists yet
            StoreStatusResponse(true, "Restaurant", "Not configured")
        }
    }

    @GetMapping("/owner/store-status")
    @PreAuthorize("hasRole('OWNER')")
    fun getOwnerStoreStatus(@AuthenticationPrincipal jwt: Jwt): StoreStatusResponse {
        val user = userSyncService.syncFromToken(jwt)
        val store = storeService.findByOwner(user)
        return if (store != null) {
            StoreStatusResponse(store.isOpen, store.storeName, store.storeAddress)
        } else {
            // Auto-create default store for owner on first access
            val newStore = storeService.setOpenStatus(user, false)
            StoreStatusResponse(newStore.isOpen, newStore.storeName, newStore.storeAddress)
        }
    }

    @PutMapping("/owner/store-status")
    @PreAuthorize("hasRole('OWNER')")
    fun updateOwnerStoreStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: StoreStatusRequest
    ): StoreStatusResponse {
        val user = userSyncService.syncFromToken(jwt)
        return try {
            val updated = storeService.setOpenStatus(user, request.isOpen)
            StoreStatusResponse(updated.isOpen, updated.storeName, updated.storeAddress)
        } catch (ex: IllegalArgumentException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, ex.message)
        }
    }
}

data class StoreStatusResponse(
    val isOpen: Boolean,
    val storeName: String,
    val storeAddress: String
)

data class StoreStatusRequest(
    val isOpen: Boolean
)
