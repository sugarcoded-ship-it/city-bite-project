package com.food.restaurant.service

import com.food.restaurant.dto.stock.CreateStockItem
import com.food.restaurant.dto.stock.StockAdjustment
import com.food.restaurant.dto.stock.StockCategoryResponse
import com.food.restaurant.dto.stock.StockResponse
import com.food.restaurant.entity.stock.MeasurementUnits
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

    fun getAllStocks(): List<StockResponse> =
        stockRepository.findAll().map { it.toResponse() }

    @Transactional
    fun adjustStock(id: Int, delta: BigDecimal): StockResponse {
        val stock = stockRepository.findById(id)
            .orElseThrow { NoSuchElementException("Stock $id not found") }
        val newAmount = stock.amount.add(delta)
        require(newAmount >= BigDecimal.ZERO) { "Stock amount cannot go below zero" }
        stock.amount = newAmount
        return stockRepository.save(stock).toResponse()
    }

    @Transactional
    fun applyAdjustments(adjustments: List<StockAdjustment>): List<StockResponse> =
        adjustments.map { adj ->
            val stock = stockRepository.findById(adj.itemId)
                .orElseThrow { NoSuchElementException("Stock ${adj.itemId} not found") }
            require(adj.newAmount >= BigDecimal.ZERO) { "Stock amount cannot go below zero" }
            stock.amount = adj.newAmount
            stockRepository.save(stock).toResponse()
        }

    @Transactional
    fun createItem(request: CreateStockItem): StockResponse {
        val category = stockCategoryRepository.findById(request.categoryId)
            .orElseThrow { IllegalArgumentException("Category ${request.categoryId} not found") }

        val stock = Stock(
            name = request.name,
            description = request.description,
            amount = request.amount,
            measureUnit = MeasurementUnits.valueOf(request.measureUnit),
            stockCategory = category,
        )

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
