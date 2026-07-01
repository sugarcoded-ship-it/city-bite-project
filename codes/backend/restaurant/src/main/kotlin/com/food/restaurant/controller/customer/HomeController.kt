package com.food.restaurant.controller.customer

import com.food.restaurant.dto.cart.AddToCartRequest
import com.food.restaurant.dto.cart.CartItemResponse
import com.food.restaurant.dto.menu.MenuItemResponse
import com.food.restaurant.dto.menu.OptionGroupResponse
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.service.CartService
import com.food.restaurant.service.MenuService
import com.food.restaurant.service.UserSyncService
import org.springframework.data.domain.Page
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@RestController("customerHomeController")
@RequestMapping("/api/customer")
class HomeController(
    private val userSyncService: UserSyncService,
    private val menuService: MenuService,
    private val cartService: CartService
) {

    @GetMapping("/")
    @PreAuthorize("isAuthenticated()")
    fun customerHome(@AuthenticationPrincipal jwt: Jwt) {
        userSyncService.syncFromToken(jwt)
    }

    @GetMapping("/menu")
    @PreAuthorize("isAuthenticated()")
    fun browseMenu(@RequestParam(required = false) category: String?): List<MenuItemResponse> {
        val categoryEnum = category?.let {
            menuCategoryEnum.fromDisplayName(it)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown category: $it")
        }
        return menuService.getAvailableMenu(categoryEnum)
    }

    @PostMapping("/cart/add")
    @PreAuthorize("isAuthenticated()")
    fun addToCart(@RequestBody request: AddToCartRequest, @AuthenticationPrincipal jwt: Jwt) {
        val userId = jwt.subject
        cartService.addItem(
            userId = userId,
            menuId = request.menuId,
            specialRequest = request.specialRequest,
            selectedChoices = request.selectedChoices ?: emptyMap(),
            quantity = request.quantity
        )
    }

    @GetMapping("/cart")
    @PreAuthorize("isAuthenticated()")
    fun getCart(@AuthenticationPrincipal jwt: Jwt): List<CartItemResponse> {
        val userId = jwt.subject
        return cartService.getCartItemsForUser(userId)
    }

    @DeleteMapping("/cart/clear")
    @PreAuthorize("isAuthenticated()")
    fun clearCurrentCart(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<Map<String, String>> {
        val userId = jwt.subject
        cartService.clearCartForUser(userId)
        return ResponseEntity.ok(mapOf("message" to "Cart cleared successfully"))
    }

    @GetMapping("/menu/{menuId}/options")
    @PreAuthorize("isAuthenticated()")
    fun getMenuOptions(@PathVariable menuId: Int): List<OptionGroupResponse> {
        return menuService.getMenuItemCustomizations(menuId)
    }

    @PatchMapping("/cart/update")
    @PreAuthorize("isAuthenticated()")
    fun updateCartItemQuantity(
        @RequestParam itemIndex: Int,
        @RequestParam change: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): List<CartItemResponse> {
        val userId = jwt.subject
        cartService.updateQuantityByIndex(userId, itemIndex, change)
        return cartService.getCartItemsForUser(userId)
    }

    @DeleteMapping("/cart/remove/{itemIndex}")
    @PreAuthorize("isAuthenticated()")
    fun removeItemFromCart(
        @PathVariable itemIndex: Int,
        @AuthenticationPrincipal jwt: Jwt
    ): List<CartItemResponse> {
        val userId = jwt.subject
        cartService.removeItemByIndex(userId, itemIndex)
        return cartService.getCartItemsForUser(userId)
    }

}