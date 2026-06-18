package com.food.restaurant.entity.menu

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class MenuStatusEnumConverter : AttributeConverter<menuStatusEnum, String> {
    override fun convertToDatabaseColumn(attribute: menuStatusEnum?): String? = attribute?.displayName

    override fun convertToEntityAttribute(dbData: String?): menuStatusEnum? =
        dbData?.let { menuStatusEnum.fromDisplayName(it) ?: error("Unknown menu status: $it") }
}