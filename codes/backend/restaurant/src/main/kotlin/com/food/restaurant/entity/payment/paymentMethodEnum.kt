package com.food.restaurant.entity.payment

import com.fasterxml.jackson.annotation.JsonValue

enum class paymentMethodEnum(val displayName: String) {
    QR_PROMPTPAY("QR PromptPay"),
    ONLINE_BANKING("Online Banking"),
    TRUEMONEY("TrueMoney"),
    CASH_ON_DELIVERY("Cash On Delivery");

    // This makes Json sends the displayName in API instead of the actual enum. It looks more beautiful
    @JsonValue
    fun toValue(): String = displayName

    companion object {
        fun fromDisplayName(name: String): paymentMethodEnum? {
            return entries.find { it.displayName.equals(name, ignoreCase = true) }
        }
    }
}