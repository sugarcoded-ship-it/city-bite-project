package com.food.restaurant.controller.owner

import com.food.restaurant.dto.menu.MenuItemRequest
import com.food.restaurant.dto.menu.MenuItemResponse
import com.food.restaurant.dto.menu.MenuRecipeRequest
import com.food.restaurant.dto.menu.MenuRecipeResponse
import com.food.restaurant.dto.menu.MenuStatusUpdateRequest
import com.food.restaurant.dto.menu.OptionGroupRequest
import com.food.restaurant.entity.menu.MenuCategory
import com.food.restaurant.entity.menu.MenuItem
import com.food.restaurant.entity.menu.MenuRecipe
import com.food.restaurant.entity.menu.MenuStatus
import com.food.restaurant.entity.menu.OptionChoice
import com.food.restaurant.entity.menu.OptionGroup
import com.food.restaurant.entity.menu.OptionIngredient
import com.food.restaurant.entity.menu.menuCategoryEnum
import com.food.restaurant.entity.menu.menuStatusEnum
import com.food.restaurant.repository.OptionIngredientRepository
import com.food.restaurant.repository.menu.MenuCategoryRepository
import com.food.restaurant.repository.menu.MenuRecipeRepository
import com.food.restaurant.repository.menu.MenuRepository
import com.food.restaurant.repository.menu.MenuStatusRepository
import com.food.restaurant.repository.menu.OptionChoiceRepository
import com.food.restaurant.repository.menu.OptionGroupRepository
import com.food.restaurant.repository.stock.StockRepository
import com.food.restaurant.service.MenuAvailabilityService
import com.food.restaurant.service.MenuService
import com.food.restaurant.service.StorageService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.math.BigDecimal

@RestController
@RequestMapping("/api/owner/menu")
@PreAuthorize("hasRole('ROLE_OWNER')")
class MenuController(
    private val menuRepository: MenuRepository,
    private val menuCategoryRepository: MenuCategoryRepository,
    private val menuStatusRepository: MenuStatusRepository,
    private val menuRecipeRepository: MenuRecipeRepository,
    private val stockRepository: StockRepository,
    private val optionGroupRepository: OptionGroupRepository,
    private val optionChoiceRepository: OptionChoiceRepository,
    private val optionIngredientRepository: OptionIngredientRepository,
    private val menuAvailabilityService: MenuAvailabilityService,
    private val menuService: MenuService,
    private val storageService: StorageService
) {
    @GetMapping
    fun getAllMenuItems(): ResponseEntity<List<MenuItemResponse>> {
        val items = menuRepository.findAll().map { item ->
            val resolved = menuAvailabilityService.syncStatus(item)
            val recipe = menuRecipeRepository.findByMenuItem_Id(resolved.id).map { MenuRecipeResponse.from(it) }
            val optionGroups = menuService.getMenuItemCustomizations(resolved.id)
            MenuItemResponse.from(resolved, recipe, optionGroups)
        }
        return ResponseEntity.ok(items)
    }

    @PostMapping("/upload-image")
    fun uploadMenuImage(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, String>> {
        val url = storageService.uploadFile(file, "menus")
        return ResponseEntity.ok(mapOf("url" to url))
    }

    @PostMapping
    @Transactional
    fun createMenuItem(@RequestBody request: MenuItemRequest): ResponseEntity<MenuItemResponse> {
        validateMenuItemRequest(request)
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
        val recipe = saveRecipe(savedItem, request.recipe)
        saveOptionGroups(savedItem, request.optionGroups)
        val freshItem = menuRepository.findById(savedItem.id).orElseThrow()
        val resolved = menuAvailabilityService.syncStatus(freshItem)
        val optionGroups = menuService.getMenuItemCustomizations(resolved.id)
        return ResponseEntity.ok(MenuItemResponse.from(resolved, recipe, optionGroups))
    }

    @PutMapping("/{id}")
    @Transactional
    fun updateMenuItem(@PathVariable id: Int, @RequestBody request: MenuItemRequest): ResponseEntity<MenuItemResponse> {
        val existing = menuRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        validateMenuItemRequest(request)
        val category = resolveCategory(request.category)
            ?: return ResponseEntity.badRequest().build()

        existing.name = request.name
        existing.price = request.price
        existing.category = category
        existing.menu_pic = request.menuPic
        existing.description = request.description

        val savedItem = menuRepository.save(existing)
        menuRecipeRepository.deleteByMenuItem_Id(id)
        val recipe = saveRecipe(savedItem, request.recipe)

        deleteOptionGroups(id)
        saveOptionGroups(savedItem, request.optionGroups)

        val resolved = menuAvailabilityService.syncStatus(savedItem)
        val optionGroups = menuService.getMenuItemCustomizations(resolved.id)
        return ResponseEntity.ok(MenuItemResponse.from(resolved, recipe, optionGroups))
    }

    // Validated up front, before any writes, so a bad request never leaves behind a
    // half-saved menu item (the transaction only rolls back on a thrown exception).
    private fun validateMenuItemRequest(request: MenuItemRequest) {
        if (request.price <= BigDecimal.ZERO) badRequest("Price must be greater than 0")
        if (request.recipe.isEmpty()) badRequest("At least one stock ingredient is required")
    }

    private fun badRequest(message: String): Nothing = throw ResponseStatusException(HttpStatus.BAD_REQUEST, message)

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
        val optionGroups = menuService.getMenuItemCustomizations(id)
        return ResponseEntity.ok(MenuItemResponse.from(resolved, recipe, optionGroups))
    }

    @DeleteMapping("/{id}")
    @Transactional
    fun deleteMenuItem(@PathVariable id: Int): ResponseEntity<Void> {
        return if (menuRepository.existsById(id)) {
            menuRecipeRepository.deleteByMenuItem_Id(id)
            deleteOptionGroups(id)
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

    private fun saveRecipe(menuItem: MenuItem, lines: List<MenuRecipeRequest>): List<MenuRecipeResponse> {
        val recipes = lines.map { line ->
            if (line.amount <= BigDecimal.ZERO) badRequest("Ingredient amount must be greater than 0")
            val stock = stockRepository.findById(line.stockId).orElse(null)
                ?: badRequest("Stock ingredient ${line.stockId} not found")
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

    // Deletes any existing option groups/choices/ingredients for a menu item.
    // Children must be removed before parents because of FK constraints.
    private fun deleteOptionGroups(menuId: Int) {
        val existingGroups = optionGroupRepository.findByMenuItem_Id(menuId)
        if (existingGroups.isEmpty()) return

        val groupIds = existingGroups.map { it.id }
        val choiceIds = optionChoiceRepository.findByOptionGroup_IdIn(groupIds).map { it.id }
        if (choiceIds.isNotEmpty()) {
            optionIngredientRepository.deleteByOptionChoiceIdIn(choiceIds)
        }
        existingGroups.forEach { group -> optionChoiceRepository.deleteByOptionGroup_Id(group.id) }
        optionGroupRepository.deleteByMenuItem_Id(menuId)
    }

    // Each choice can carry its own extra price and its own ingredient/stock
    // consumption, independent from the base menu item's recipe. A group must offer
    // at least one choice, and a choice must be tied to at least one stock ingredient
    // so its availability can be derived from real stock levels.
    private fun saveOptionGroups(menuItem: MenuItem, groups: List<OptionGroupRequest>) {
        groups.forEach { groupReq ->
            if (groupReq.groupName.isBlank()) badRequest("Option group name is required")
            if (groupReq.choices.isEmpty()) badRequest("Option group '${groupReq.groupName}' needs at least one choice")

            val savedGroup = optionGroupRepository.save(
                OptionGroup(
                    menuItem = menuItem,
                    groupName = groupReq.groupName,
                    isRequired = groupReq.isRequired,
                    maxChoices = if (groupReq.maxChoices > 0) groupReq.maxChoices else 1
                )
            )

            groupReq.choices.forEach { choiceReq ->
                if (choiceReq.choiceName.isBlank()) badRequest("Choice name is required")
                if (choiceReq.extraPrice < BigDecimal.ZERO) badRequest("Choice price cannot be negative")
                if (choiceReq.ingredients.isEmpty()) badRequest("Choice '${choiceReq.choiceName}' must be tied to at least one stock ingredient")

                val savedChoice = optionChoiceRepository.save(
                    OptionChoice(
                        optionGroup = savedGroup,
                        choiceName = choiceReq.choiceName,
                        extraPrice = choiceReq.extraPrice
                    )
                )

                choiceReq.ingredients.forEach { ingredientReq ->
                    if (ingredientReq.amount <= BigDecimal.ZERO) badRequest("Ingredient amount must be greater than 0")
                    val stock = stockRepository.findById(ingredientReq.stockId).orElse(null)
                        ?: badRequest("Stock ingredient ${ingredientReq.stockId} not found")
                    optionIngredientRepository.save(
                        OptionIngredient(
                            optionChoice = savedChoice,
                            stock = stock,
                            amount = ingredientReq.amount,
                            measureUnit = stock.measureUnit
                        )
                    )
                }
            }
        }
    }
}
