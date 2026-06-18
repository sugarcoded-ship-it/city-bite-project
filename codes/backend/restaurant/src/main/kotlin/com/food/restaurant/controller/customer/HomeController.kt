package com.food.restaurant.controller.customer

import com.food.restaurant.dto.menu.MenuItemResponse
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.service.MenuService
import com.food.restaurant.service.UserSyncService
import org.springframework.security.oauth2.jwt.Jwt // CORRECT IMPORT
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus

@RestController("customerHomeController")
@RequestMapping("/api/customer")
class HomeController(
    private val userSyncService: UserSyncService,
    private val menuService: MenuService
) {

    @GetMapping("/")
    @PreAuthorize("isAuthenticated()")
    fun customerHome(@AuthenticationPrincipal jwt: Jwt) {
        // Store userInfo to db

        userSyncService.syncFromToken(jwt)
        // TODO: Return all wa category
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
}