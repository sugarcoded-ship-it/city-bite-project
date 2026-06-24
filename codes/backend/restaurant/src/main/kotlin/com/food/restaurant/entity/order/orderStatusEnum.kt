package com.food.restaurant.entity.order

import com.fasterxml.jackson.annotation.JsonValue

enum class orderStatusEnum(val displayName: String) {
    PENDING("Pending"),
    RECEIVED("Received"),
    PROCESSING("Processing"),
    ON_DELIVERY("On Delivery"),
    SHIPPED("Shipped"),
    CANCELED("Canceled");

    // This makes Json sends the displayName in API instead of the actual enum. It looks more beautiful
    @JsonValue
    fun toValue(): String = displayName

    companion object {
        fun fromDisplayName(name: String): orderStatusEnum? {
            return entries.find { it.displayName.equals(name, ignoreCase = true) }
        }
    }
}