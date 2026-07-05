package com.food.restaurant.service

import com.food.restaurant.repository.store.StoreRepository
import org.springframework.stereotype.Service

@Service
class StoreService(private val storeRepository: StoreRepository) {
    fun isStoreOpen(): Boolean = storeRepository.findAll().firstOrNull()?.isOpen ?: false
}