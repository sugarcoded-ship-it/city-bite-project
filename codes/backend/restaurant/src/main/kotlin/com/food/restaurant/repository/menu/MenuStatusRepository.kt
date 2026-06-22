package com.food.restaurant.repository.menu

import com.food.restaurant.entity.menu.MenuStatus
import com.food.restaurant.entity.menu.menuStatusEnum
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MenuStatusRepository : JpaRepository<MenuStatus, Int> {
    fun findByName(name: menuStatusEnum): MenuStatus?
}