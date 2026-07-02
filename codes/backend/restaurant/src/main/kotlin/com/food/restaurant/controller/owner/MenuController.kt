package com.food.restaurant.controller.owner

import com.food.restaurant.dto.menu.MenuItemRequest
import com.food.restaurant.dto.menu.MenuItemResponse
import com.food.restaurant.dto.menu.MenuRecipeRequest
import com.food.restaurant.dto.menu.MenuRecipeResponse
import com.food.restaurant.dto.menu.MenuStatusUpdateRequest
import com.food.restaurant.entity.menu.MenuCategory
import com.food.restaurant.entity.menu.MenuItem
import com.food.restaurant.entity.menu.MenuRecipe
import com.food.restaurant.entity.menu.MenuStatus
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.entity.menu.menuStatusEnum
import com.food.restaurant.repository.menu.MenuCategoryRepository
import com.food.restaurant.repository.menu.MenuRecipeRepository
import com.food.restaurant.repository.menu.MenuRepository
import com.food.restaurant.repository.menu.MenuStatusRepository
import com.food.restaurant.repository.stock.StockRepository
import com.food.restaurant.service.MenuAvailabilityService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/owner/menu")
@PreAuthorize("hasRole('ROLE_OWNER')")
class MenuController(
    private val menuRepository: MenuRepository,
    private val menuCategoryRepository: MenuCategoryRepository,
    private val menuStatusRepository: MenuStatusRepository,
    private val menuRecipeRepository: MenuRecipeRepository,
    private val stockRepository: StockRepository,
    private val menuAvailabilityService: MenuAvailabilityService
) {
    @GetMapping
    fun getAllMenuItems(): ResponseEntity<List<MenuItemResponse>> {
        val items = menuRepository.findAll().map { item ->
            val resolved = menuAvailabilityService.syncStatus(item)
            val recipe = menuRecipeRepository.findByMenuItem_Id(resolved.id).map { MenuRecipeResponse.from(it) }
            MenuItemResponse.from(resolved, recipe)
        }
        return ResponseEntity.ok(items)
    }

    @PostMapping
    @Transactional
    fun createMenuItem(@RequestBody request: MenuItemRequest): ResponseEntity<MenuItemResponse> {
        val category = resolveCategory(request.category)
            ?: return ResponseEntity.badRequest().build()
        val status = resolveStatus(menuStatusEnum.ACTIVE)

        val item = MenuItem(
            category = category,
            status = status,
            name = request.name,
            price = request.price,
            menu_pic = request.menuPic,
            description = request.description
        )

        val savedItem = menuRepository.save(item)
        val recipe = saveRecipe(savedItem, request.recipe) ?: return ResponseEntity.badRequest().build()
        val freshItem = menuRepository.findById(savedItem.id).orElseThrow()
        val resolved = menuAvailabilityService.syncStatus(freshItem)
        return ResponseEntity.ok(MenuItemResponse.from(resolved, recipe))
    }

    @PutMapping("/{id}")
    @Transactional
    fun updateMenuItem(@PathVariable id: Int, @RequestBody request: MenuItemRequest): ResponseEntity<MenuItemResponse> {
        val existing = menuRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val category = resolveCategory(request.category)
            ?: return ResponseEntity.badRequest().build()

        existing.name = request.name
        existing.price = request.price
        existing.category = category
        existing.menu_pic = request.menuPic
        existing.description = request.description

        val savedItem = menuRepository.save(existing)
        menuRecipeRepository.deleteByMenuItem_Id(id)
        val recipe = saveRecipe(savedItem, request.recipe) ?: return ResponseEntity.badRequest().build()
        val resolved = menuAvailabilityService.syncStatus(savedItem)
        return ResponseEntity.ok(MenuItemResponse.from(resolved, recipe))
    }

    @PatchMapping("/{id}/status")
    @Transactional
    fun updateMenuItemStatus(@PathVariable id: Int, @RequestBody request: MenuStatusUpdateRequest): ResponseEntity<MenuItemResponse> {
        val existing = menuRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // OUT_OF_ORDER is a derived state based on stock and can't be set manually.
        val targetEnum = menuStatusEnum.entries.find { it.name == request.status && it != menuStatusEnum.OUT_OF_ORDER }
            ?: return ResponseEntity.badRequest().build()

        existing.status = resolveStatus(targetEnum)
        val savedItem = menuRepository.save(existing)
        val resolved = menuAvailabilityService.syncStatus(savedItem)
        val recipe = menuRecipeRepository.findByMenuItem_Id(id).map { MenuRecipeResponse.from(it) }
        return ResponseEntity.ok(MenuItemResponse.from(resolved, recipe))
    }

    @DeleteMapping("/{id}")
    @Transactional
    fun deleteMenuItem(@PathVariable id: Int): ResponseEntity<Void> {
        return if (menuRepository.existsById(id)) {
            menuRecipeRepository.deleteByMenuItem_Id(id)
            menuRepository.deleteById(id)
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    private fun resolveCategory(displayName: String): MenuCategory? {
        val categoryEnum = menuCategoryEnum.fromDisplayName(displayName) ?: return null
        return menuCategoryRepository.findByName(categoryEnum)
            ?: menuCategoryRepository.save(MenuCategory(name = categoryEnum))
    }

    private fun resolveStatus(statusEnum: menuStatusEnum): MenuStatus {
        return menuStatusRepository.findByName(statusEnum)
            ?: menuStatusRepository.save(MenuStatus(name = statusEnum))
    }

    private fun saveRecipe(menuItem: MenuItem, lines: List<MenuRecipeRequest>): List<MenuRecipeResponse>? {
        val recipes = lines.map { line ->
            val stock = stockRepository.findById(line.stockId).orElse(null) ?: return null
            MenuRecipe(
                menuItem = menuItem,
                stock = stock,
                amount = line.amount,
                measureUnit = stock.measureUnit
            )
        }
        val saved = menuRecipeRepository.saveAll(recipes)
        return saved.map { MenuRecipeResponse.from(it) }
    }
}