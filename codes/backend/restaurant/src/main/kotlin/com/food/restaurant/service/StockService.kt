package com.food.restaurant.service

import com.food.restaurant.dto.stock.StockCategoryResponse
import com.food.restaurant.dto.stock.StockResponse
import com.food.restaurant.entity.stock.Stock
import com.food.restaurant.repository.StockCategoryRepository
import com.food.restaurant.repository.StockRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class StockService(
    private val stockRepository: StockRepository,
    private val stockCategoryRepository: StockCategoryRepository,
) {
    fun getCategories(): List<StockCategoryResponse> =
        stockCategoryRepository.findAll().map { StockCategoryResponse(it.id, it.name) }
    fun getStocksByCategory(categoryId: Int): List<StockResponse> =
        stockRepository.findAllByStockCategoryId(categoryId).map { it.toResponse() }

    @Transactional
    fun adjustStock(id: Int, delta: BigDecimal): StockResponse {
        val stock = stockRepository.findById(id)
            .orElseThrow { NoSuchElementException("Stock $id not found") }
        val newAmount = stock.amount.add(delta)
        require(newAmount >= BigDecimal.ZERO) { "Stock amount cannot go below zero" }
        stock.amount = newAmount
        return stockRepository.save(stock).toResponse()
    }

    private fun Stock.toResponse(): StockResponse = StockResponse(
        id = id,
        name = name,
        description = description,
        amount = amount,
        measureUnit = measureUnit,
        categoryId = stockCategory.id,
    )
}