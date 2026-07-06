package com.food.restaurant.service

import com.food.restaurant.dto.store.StoreDetailRequest
import com.food.restaurant.dto.store.StoreDetailResponse
import com.food.restaurant.dto.store.StoreStatusRequest
import com.food.restaurant.dto.store.StoreStatusResponse
import com.food.restaurant.entity.store.Store
import com.food.restaurant.repository.store.StoreRepository
import com.food.restaurant.repository.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class StoreService(
    private val storeRepository: StoreRepository,
    private val userRepository: UserRepository
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
                store.logo_url,
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
            logo_url = req.logoUrl,
            phone = req.phone,
            openTime = req.openTime,
            closeTime = req.closeTime,
            isOpen = false
        )
        storeRepository.save(store)
        return StoreDetailResponse(
            store.storeName,
            store.storeAddress,
            store.logo_url,
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
        store.logo_url = req.logoUrl
        store.phone = req.phone
        store.openTime = req.openTime
        store.closeTime = req.closeTime
        storeRepository.save(store)
        return StoreDetailResponse(
            store.storeName,
            store.storeAddress,
            store.logo_url,
            store.phone,
            store.openTime,
            store.closeTime,
            store.isOpen
        )
    }
}
