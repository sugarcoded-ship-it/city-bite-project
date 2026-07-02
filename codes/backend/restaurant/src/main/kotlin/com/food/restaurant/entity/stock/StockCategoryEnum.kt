package com.food.restaurant.entity.stock

import com.fasterxml.jackson.annotation.JsonValue

enum class StockCategoryEnum(val displayName: String) {
    MEAT_POULTRY("Meat & Poultry"),
    VEGETABLES("Vegetables"),
    FRUITS("Fruits"),
    DAIRY_EGGS("Dairy & Eggs"),
    BEVERAGES("Beverages"),
    SPICES("Spices"),
    MISCELLANEOUS("Misc");

    // This makes Json sends the displayName in API instead of the actual enum. It looks more beautiful
    @JsonValue
    fun toValue(): String = displayName

    companion object {
        fun fromDisplayName(name: String): StockCategoryEnum? {
            return entries.find { it.displayName.equals(name, ignoreCase = true) }
        }
    }
}