package com.food.restaurant.entity.menu

import com.fasterxml.jackson.annotation.JsonValue

enum class menuCategoryEnum(val displayName: String) {
    APPETIZER("Appetizer"),
    MAIN_DISH("Main Dish"),
    BROTH("Broth"),
    SIDE_DISH("Side Dish"),
    DESSERT("Dessert"),
    DRINK("Drink"),
    SPECIAL("Chef's Special");

    // This makes Json sends the displayName in API instead of the actual enum. It looks more beautiful
    @JsonValue
    fun toValue(): String = displayName

    companion object {
        fun fromDisplayName(name: String): menuCategoryEnum? {
            return entries.find { it.displayName.equals(name, ignoreCase = true) }
        }
    }
}