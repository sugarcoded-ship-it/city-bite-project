package com.food.restaurant.service

import com.food.restaurant.dto.CartItemSummary
import com.food.restaurant.dto.CartItemRequest
import com.food.restaurant.dto.CartSummaryResponse
import com.food.restaurant.dto.CreateOrderRequest
import com.food.restaurant.dto.OptionSummaryResponse
import com.food.restaurant.entity.order.Order
import com.food.restaurant.entity.order.OrderDetail
import com.food.restaurant.entity.order.OrderItemSelection
import com.food.restaurant.entity.order.orderStatusEnum
import com.food.restaurant.entity.payment.PaymentTransaction
import com.food.restaurant.entity.payment.RefundCredit
import com.food.restaurant.entity.payment.RefundCreditLog
import com.food.restaurant.repository.cart.CartItemRepository
import com.food.restaurant.repository.user.AddressRepository
import com.food.restaurant.repository.menu.MenuRepository
import com.food.restaurant.repository.menu.OptionChoiceRepository
import com.food.restaurant.repository.order.OrderDetailRepository
import com.food.restaurant.repository.order.OrderItemSelectionRepository
import com.food.restaurant.repository.order.OrderStatusRepository
import com.food.restaurant.repository.order.OrderSummaryRepository
import com.food.restaurant.repository.payment.PaymentMethodRepository
import com.food.restaurant.repository.payment.PaymentTransactionRepository
import com.food.restaurant.repository.payment.RefundCreditLogRepository
import com.food.restaurant.repository.payment.RefundCreditRepository
import com.food.restaurant.repository.user.UserRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.util.UUID

@Service
class OrderSummaryService(
    private val menuRepository: MenuRepository,
    private val optionChoiceRepository: OptionChoiceRepository,
    private val orderRepository: OrderSummaryRepository,
    private val userRepository: UserRepository,
    private val addressRepository: AddressRepository,
    private val orderStatusRepository: OrderStatusRepository,
    private val orderDetailRepository: OrderDetailRepository,
    private val orderItemSelectionRepository: OrderItemSelectionRepository,
    private val paymentMethodRepository: PaymentMethodRepository,
    private val paymentTransactionRepository: PaymentTransactionRepository,
    private val refundCreditRepository: RefundCreditRepository,
    private val refundCreditLogRepository: RefundCreditLogRepository,
    private val cartItemRepository: CartItemRepository
) {
    fun summarizeCartBeforePayment(requestedItems: List<CartItemRequest>): CartSummaryResponse {

        var grandTotal = BigDecimal.ZERO
        val summaryItems = mutableListOf<CartItemSummary>()

        for (requestItem in requestedItems) {

            val menuItem = menuRepository.findById(requestItem.menuId)
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
                    menuId = menuItem.id,
                    menuName = menuItem.name,
                    amount = requestItem.amount,
                    specialRequest = requestItem.specialRequest,
                    unitPrice = menuItem.price,
                    lineTotal = lineTotal,
                    selectedOptions = optionSummaries,
                    selectedChoiceIds = requestItem.selectedChoiceIds
                )
            )
        }

        return CartSummaryResponse(
            items = summaryItems,
            totalPrice = grandTotal
        )
    }


    @Transactional
    fun processCheckout(request: CreateOrderRequest): Order {
        val customerEntity = userRepository.findById(request.customerUuid)
            .orElseThrow { IllegalArgumentException("Customer not found") }

        val addressEntity = addressRepository.findById(request.addressId)
            .orElseThrow { IllegalArgumentException("Address not found") }

        val pendingStatus = orderStatusRepository.findByStatusName(orderStatusEnum.PENDING)
            ?: throw IllegalArgumentException("Order status PENDING not found")
        val paymentMethodEntity = paymentMethodRepository.findById(request.paymentMethodId)
            .orElseThrow { IllegalArgumentException("Payment method not found") }

        val orderToSave = Order(
            customer = customerEntity,
            address = addressEntity,
            orderStatus = pendingStatus,
            totalPrice = request.totalPrice
        )
        val savedOrder = orderRepository.save(orderToSave)

        request.items.forEach { cartItem ->
            val menuItemEntity = menuRepository.findById(cartItem.menuId)
                .orElseThrow { IllegalArgumentException("Menu item not found: ${cartItem.menuId}") }

            var itemUnitPrice: BigDecimal = menuItemEntity.price

            val fetchedChoices = cartItem.selectedChoiceIds.map { choiceId ->
                optionChoiceRepository.findById(choiceId)
                    .orElseThrow { IllegalArgumentException("Option choice not found: $choiceId") }
            }

            for (choiceEntity in fetchedChoices) {
                val extraPriceBigDecimal = choiceEntity.extraPrice
                itemUnitPrice = itemUnitPrice.add(extraPriceBigDecimal)
            }

            val calculatedLinePrice = itemUnitPrice.multiply(BigDecimal.valueOf(cartItem.amount.toLong()))

            val detailToSave = OrderDetail(
                order = savedOrder,
                menuItem = menuItemEntity,
                amount = cartItem.amount,
                specialRequest = null,
                price = calculatedLinePrice
            )
            val savedDetail = orderDetailRepository.save(detailToSave)

            cartItem.selectedChoiceIds.forEach { choiceId ->
                val choiceEntity = optionChoiceRepository.findById(choiceId)
                    .orElseThrow { IllegalArgumentException("Option choice not found: $choiceId") }

                val selectionToSave = OrderItemSelection(
                    orderDetail = savedDetail,
                    optionChoice = choiceEntity
                )
                orderItemSelectionRepository.save(selectionToSave)
            }
        }

        val transactionMock = PaymentTransaction(
            order = savedOrder,
            paymentMethod = paymentMethodEntity,
            amount = savedOrder.totalPrice,
            currency = "THB",
            referenceId = "MOCK-TXN-${UUID.randomUUID()}",
            description = "Successful payment for Order #${savedOrder.id}"
        )
        paymentTransactionRepository.save(transactionMock)

        cartItemRepository.deleteByCustomerUuid(request.customerUuid)

        return savedOrder
    }


    @Transactional
    fun cancelOrder(orderId: Int) {
        val orderEntity = orderRepository.findById(orderId)
            .orElseThrow { IllegalArgumentException("Order not found with ID: $orderId") }

        val canceledStatus = orderStatusRepository.findByStatusName(orderStatusEnum.CANCELED)
            ?: throw IllegalArgumentException("Order status CANCELED not found")
        orderEntity.orderStatus = canceledStatus
        orderRepository.save(orderEntity)

        val originalTransaction = paymentTransactionRepository.findByOrderId(orderId)
            ?: return

        val customer = orderEntity.customer

        val refundLog = RefundCreditLog(
            paymentTransaction = originalTransaction,
            customer = customer,
            amount = originalTransaction.amount
        )
        refundCreditLogRepository.save(refundLog)

        val wallet = refundCreditRepository.findByCustomer_Id(customer.id)
            ?: RefundCredit(customer = customer, amount = BigDecimal.ZERO)

        wallet.amount = wallet.amount.add(originalTransaction.amount)
        refundCreditRepository.save(wallet)
    }
}