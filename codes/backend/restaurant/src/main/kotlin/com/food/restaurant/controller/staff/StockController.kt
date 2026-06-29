package com.food.restaurant.controller.staff

import com.food.restaurant.dto.stock.AdjustStockRequest
import com.food.restaurant.dto.stock.StockCategoryResponse
import com.food.restaurant.dto.stock.StockResponse
import com.food.restaurant.dto.stock.BatchAdjustRequest
import com.food.restaurant.service.StockService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import com.food.restaurant.dto.stock.CreateStockItem
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@RestController("StaffStockController")
@RequestMapping("/api/staff/stocks")
@PreAuthorize("hasAnyRole('STAFF', 'OWNER')")
class StockController(
    private val stockService: StockService,
) {
    @GetMapping("/categories")
    fun getCategories(): ResponseEntity<List<StockCategoryResponse>> =
        ResponseEntity.ok(stockService.getCategories())

    @GetMapping
    fun getStocks(@RequestParam categoryId: Int): List<StockResponse> =
        stockService.getStocksByCategory(categoryId)

    @PatchMapping("/{id}/adjust")
    fun adjust(@PathVariable id: Int, @RequestBody body: AdjustStockRequest): StockResponse =
        stockService.adjustStock(id, body.delta)

    @GetMapping("/items")
    fun allItems(): ResponseEntity<List<StockResponse>> =
        ResponseEntity.ok(stockService.getAllStocks())

    @PostMapping("/items")
    fun createItem(@RequestBody request: CreateStockItem): StockResponse =
        stockService.createItem(request)


    @PatchMapping("/adjust")
    fun batchAdjust(@RequestBody body: BatchAdjustRequest) =
        stockService.applyAdjustments(body.adjustments)
}