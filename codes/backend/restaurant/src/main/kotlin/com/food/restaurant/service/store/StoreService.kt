package com.food.restaurant.service.store

import com.food.restaurant.dto.store.StoreDetailRequest
import com.food.restaurant.dto.store.StoreDetailResponse
import com.food.restaurant.dto.store.StoreStatusRequest
import com.food.restaurant.dto.store.StoreStatusResponse
import com.food.restaurant.service.address.GeocodingService
import com.food.restaurant.entity.store.Store
import com.food.restaurant.repository.store.StoreRepository
import com.food.restaurant.repository.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class StoreService(
    private val storeRepository: StoreRepository,
    private val userRepository: UserRepository,
    private val geocodingService: GeocodingService
) {

    fun isStoreOpen(): Boolean = storeRepository.findAll().firstOrNull()?.isOpen ?: false

    fun getStore(id: UUID): Store? {
        return storeRepository.findByOwnerId(id)
    }

    fun getGlobalStore(): Store? {
        return storeRepository.findTopByOrderByIdAsc()
    }

    fun getStoreDetail(id: UUID): StoreDetailResponse? {
        val store = storeRepository.findByOwnerId(id)
        return if (store != null) {
            StoreDetailResponse(
                store.storeName,
                store.storeAddress,
                store.phone,
                store.openTime,
                store.closeTime,
                store.isOpen,
            )
        } else {
            null
        }
    }

    @Transactional
    fun updateStoreStatus(id: UUID, req: StoreStatusRequest): StoreStatusResponse? {
        val store = storeRepository.findByOwnerId(id) ?: return null
        store.isOpen = req.isOpen
        storeRepository.save(store)
        return StoreStatusResponse(store.isOpen, store.storeName, store.storeAddress)
    }

    @Transactional
    fun createStoreDetail(id: UUID, req: StoreDetailRequest): StoreDetailResponse {
        var store = storeRepository.findByOwnerId(id)
        if (store != null) {
            throw RuntimeException("Store already exists for this owner")
        }
        val owner = userRepository.findById(id).orElseThrow { RuntimeException("User not found") }
        store = Store(
            owner = owner,
            storeName = req.storeName,
            storeAddress = req.storeAddress,
            phone = req.phone,
            openTime = req.openTime,
            closeTime = req.closeTime,
            isOpen = false
        )

        geocodingService.geocode(store.storeAddress)
            ?.let { store.latitude = it.lat; store.longitude = it.lng }

        storeRepository.save(store)
        return StoreDetailResponse(
            store.storeName,
            store.storeAddress,
            store.phone,
            store.openTime,
            store.closeTime,
            store.isOpen
        )
    }

    @Transactional
    fun updateStoreDetail(id: UUID, req: StoreDetailRequest): StoreDetailResponse {
        val store = storeRepository.findByOwnerId(id) ?: throw RuntimeException("Store not found")
        store.storeName = req.storeName
        store.storeAddress = req.storeAddress
        store.phone = req.phone
        store.openTime = req.openTime
        store.closeTime = req.closeTime
        storeRepository.save(store)

        geocodingService.geocode(store.storeAddress)
            ?.let { store.latitude = it.lat; store.longitude = it.lng }

        return StoreDetailResponse(
            store.storeName,
            store.storeAddress,
            store.phone,
            store.openTime,
            store.closeTime,
            store.isOpen
        )
    }
}
