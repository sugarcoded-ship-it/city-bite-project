package com.food.restaurant.service

import com.food.restaurant.entity.store.Store
import com.food.restaurant.entity.user.User
import com.food.restaurant.repository.StoreRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalTime

@Service
class StoreService(private val storeRepository: StoreRepository) {

    fun isStoreOpen(): Boolean = storeRepository.findAll().firstOrNull()?.isOpen ?: false

    fun findByOwner(owner: User): Store? = storeRepository.findByOwner(owner)

    fun findGlobalStore(): Store? = storeRepository.findTopByOrderByIdAsc()

    @Transactional
    fun setOpenStatus(owner: User, open: Boolean): Store {
        val store = storeRepository.findByOwner(owner)
        return if (store != null) {
            store.isOpen = open
            storeRepository.save(store)
        } else {
            val newStore = Store(
                owner = owner,
                storeName = "${owner.firstName ?: owner.username}'s Store",
                storeAddress = "Unknown address",
                logo_url = "",
                phone = "0000000000",
                city = "Unknown city",
                postalCode = "00000",
                openTime = LocalTime.of(0, 0),
                closeTime = LocalTime.of(23, 59),
                isOpen = open
            )
            storeRepository.save(newStore)
        }
    }
}
