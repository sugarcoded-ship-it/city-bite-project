package com.food.restaurant.repository.store

import com.food.restaurant.entity.store.Store
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface StoreRepository : JpaRepository<Store, Int> {
    fun findByOwner_Id(keycloakUuid: UUID): Optional<Store>
}