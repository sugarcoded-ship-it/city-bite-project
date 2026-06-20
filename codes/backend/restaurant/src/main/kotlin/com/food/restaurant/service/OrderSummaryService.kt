package com.food.restaurant.service

import com.food.restaurant.dto.CartItemSummary
import com.food.restaurant.dto.CartItemRequest
import com.food.restaurant.dto.CartSummaryResponse
import com.food.restaurant.dto.OptionSummaryResponse
import com.food.restaurant.repository.MenuItemRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class OrderSummaryService(
    private val menuItemRepository: MenuItemRepository,
    private val optionChoiceRepository: OptionChoiceRepository
) {
    fun summarizeCartBeforePayment(requestedItems: List<CartItemRequest>): CartSummaryResponse {

        var grandTotal = BigDecimal.ZERO
        val summaryItems = mutableListOf<CartItemSummary>()

        for (requestItem in requestedItems) {

            val menuItem = menuItemRepository.findById(requestItem.menuId)
                .orElseThrow { IllegalArgumentException("Menu item ${requestItem.menuId} not found!") }

            val selectedChoices = optionChoiceRepository.findAllById(requestItem.selectedChoiceIds)

            var extrasTotal = BigDecimal.ZERO
            val optionSummaries = mutableListOf<OptionSummaryResponse>()

            for (choice in selectedChoices){
                extrasTotal +=  choice.extraPrice
                optionSummaries.add(OptionSummaryResponse(choice.choiceName, choice.extraPrice))
            }

            val unitPriceWithExtras = menuItem.price + extrasTotal
            val lineTotal = unitPriceWithExtras * BigDecimal(requestItem.amount)

            grandTotal += lineTotal

            summaryItems.add(
                CartItemSummary(
                    menuName = menuItem.name,
                    amount = requestItem.amount,
                    unitPrice = menuItem.price,
                    lineTotal = lineTotal,
                    selectedOptions = optionSummaries
                )
            )
        }

        return CartSummaryResponse(
            items = summaryItems,
            totalPrice = grandTotal
        )
    }
}