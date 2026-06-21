package com.food.restaurant.repository

import com.food.restaurant.entity.store.Store
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID
import java.util.Optional

@Repository
interface StoreRepository : JpaRepository<Store, Int> {
    fun findByKeycloakUuid(keycloakUuid: UUID): Optional<Store>
}