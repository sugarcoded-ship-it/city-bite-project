package com.food.restaurant.entity.menu

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class MenuCategoryEnumConverter : AttributeConverter<menuCategoryEnum, String> {
    override fun convertToDatabaseColumn(attribute: menuCategoryEnum?): String? = attribute?.displayName

    override fun convertToEntityAttribute(dbData: String?): menuCategoryEnum? =
        dbData?.let { menuCategoryEnum.fromDisplayName(it) ?: error("Unknown menu category: $it") }
}