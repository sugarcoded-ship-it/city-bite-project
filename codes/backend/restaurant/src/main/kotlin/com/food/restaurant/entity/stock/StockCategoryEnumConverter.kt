package com.food.restaurant.entity.stock

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter
class StockCategoryEnumConverter : AttributeConverter<stockCategoryEnum, String> {
    override fun convertToDatabaseColumn(attribute: stockCategoryEnum?): String? =
        attribute?.displayName

    override fun convertToEntityAttribute(dbData: String?): stockCategoryEnum? =
        dbData?.let { stockCategoryEnum.fromDisplayName(name = it) }
}