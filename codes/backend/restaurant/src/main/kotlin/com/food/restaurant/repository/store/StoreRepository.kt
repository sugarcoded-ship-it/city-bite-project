package com.food.restaurant.repository.store

import com.food.restaurant.entity.store.Store
import com.food.restaurant.entity.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface StoreRepository : JpaRepository<Store, Int> {
    fun findByOwner(owner: User): Store?
    fun findTopByIsOpenTrue(): Store?
    fun findTopByOrderByIdAsc(): Store?
    fun findByOwnerId(ownerId: UUID): Store?
}