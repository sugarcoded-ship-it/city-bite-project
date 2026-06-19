// controller/staff/StockController.kt
package com.food.restaurant.controller.staff

import com.food.restaurant.dto.stock.AdjustStockRequest
import com.food.restaurant.dto.stock.StockCategoryResponse
import com.food.restaurant.dto.stock.StockResponse
import com.food.restaurant.service.StockService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/staff/stocks")
@PreAuthorize("hasAnyRole('STAFF', 'OWNER')")
class StockController(
    private val stockService: StockService,
) {
    @GetMapping("/categories")
    fun getCategories(): List<StockCategoryResponse> = stockService.getCategories()

    @GetMapping
    fun getStocks(@RequestParam categoryId: Int): List<StockResponse> =
        stockService.getStocksByCategory(categoryId)

    @PatchMapping("/{id}/adjust")
    fun adjust(@PathVariable id: Int, @RequestBody body: AdjustStockRequest): StockResponse =
        stockService.adjustStock(id, body.delta)
}