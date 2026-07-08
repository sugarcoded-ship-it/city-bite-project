package com.food.restaurant.service

import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class FinancialEventSeeder(
    private val ownerService: OwnerService
) : CommandLineRunner {

    override fun run(vararg args: String) {
        ownerService.seedAnalyticsTestData()
    }
}
