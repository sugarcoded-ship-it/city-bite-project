package com.food.restaurant.controller.owner

import com.food.restaurant.dto.stock.StockResponse
import com.food.restaurant.repository.StockRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/owner/stock")
@PreAuthorize("hasRole('ROLE_OWNER')")
class StockController(
    private val stockRepository: StockRepository
) {
    @GetMapping
    fun getAllStocks(): ResponseEntity<List<StockResponse>> {
        val stocks = stockRepository.findAll().map { StockResponse.from(it) }
        return ResponseEntity.ok(stocks)
    }
}
