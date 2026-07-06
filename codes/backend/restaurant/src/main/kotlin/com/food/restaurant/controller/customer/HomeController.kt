package com.food.restaurant.controller.customer

import com.food.restaurant.dto.cart.AddToCartRequest
import com.food.restaurant.dto.cart.CartItemResponse
import com.food.restaurant.dto.menu.MenuItemResponse
import com.food.restaurant.dto.menu.OptionGroupResponse
import com.food.restaurant.dto.user.customer.CustomerDashboardResponse
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.service.CartService
import com.food.restaurant.service.MenuService
import com.food.restaurant.service.StoreService
import com.food.restaurant.service.UserSyncService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController("customerHomeController")
@RequestMapping("/api/customer")
class HomeController(
    private val userSyncService: UserSyncService,
    private val menuService: MenuService,
    private val cartService: CartService,
    private val storeService: StoreService
) {

    @GetMapping("/")
    @PreAuthorize("isAuthenticated()")
    fun customerHome(@AuthenticationPrincipal jwt: Jwt): CustomerDashboardResponse {
        userSyncService.syncFromToken(jwt)
        val store = storeService.getGlobalStore()
        val menuItems = menuService.getAvailableMenu(null)
        return CustomerDashboardResponse(
            menuItems = menuItems,
            status = if (store?.isOpen == true) "OPEN" else "CLOSED",
            storeName = store?.storeName ?: "Restaurant"
        )
    }

    @GetMapping("/store-status")
    @PreAuthorize("isAuthenticated()")
    fun getStoreStatus(): Map<String, Boolean> {
        return mapOf("isOpen" to storeService.isStoreOpen())
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