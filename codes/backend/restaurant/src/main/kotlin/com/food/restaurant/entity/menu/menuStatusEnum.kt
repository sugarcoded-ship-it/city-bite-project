package com.food.restaurant.entity.menu

enum class menuStatusEnum(val displayName: String) {
    ACTIVE("Available"),
    OUT_OF_ORDER("Out of Stock"),
    DEACTIVATED("Deactivated");

    companion object {
        fun fromDisplayName(name: String): menuStatusEnum? {
            return entries.find { it.displayName.equals(name, ignoreCase = true) }
        }
    }
}