package com.food.restaurant.service

import com.food.restaurant.entity.order.Order
import com.food.restaurant.entity.payment.RefundCredit
import com.food.restaurant.entity.payment.RefundCreditLog
import com.food.restaurant.entity.payment.RefundCreditLogType
import com.food.restaurant.entity.user.User
import com.food.restaurant.repository.payment.RefundCreditLogRepository
import com.food.restaurant.repository.payment.RefundCreditRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.util.UUID

@Service
class RefundCreditService(
    private val refundCreditRepository: RefundCreditRepository,
    private val refundCreditLogRepository: RefundCreditLogRepository
) {

    fun getBalance(customerUuid: UUID): BigDecimal {
        val credit = refundCreditRepository.findByCustomer_Id(customerUuid)
        return credit?.amount ?: BigDecimal.ZERO
    }

    fun getHistory(customerUuid: UUID, pageable: Pageable): Page<RefundCreditLog> =
        refundCreditLogRepository.findByCustomer_IdOrderByCreatedAtDesc(customerUuid, pageable)

    @Transactional
    fun addCredit(user: User, amount: BigDecimal) {
        creditToWallet(user, amount)
        refundCreditLogRepository.save(
            RefundCreditLog(customer = user, amount = amount, type = RefundCreditLogType.EARNED)
        )
    }

    @Transactional
    fun useCredit(user: User, amountToUse: BigDecimal): Boolean {
        return spendCredit(user, amountToUse, order = null, description = null)
    }

    @Transactional
    fun creditRefund(customer: User, amount: BigDecimal, order: Order? = null, description: String? = null) {
        if (amount <= BigDecimal.ZERO) return
        creditToWallet(customer, amount)
        refundCreditLogRepository.save(
            RefundCreditLog(customer = customer, amount = amount, type = RefundCreditLogType.EARNED, order = order, description = description)
        )
    }

    @Transactional
    fun spendCredit(customer: User, amount: BigDecimal, order: Order? = null, description: String? = null): Boolean {
        if (amount <= BigDecimal.ZERO) return true
        val credit = refundCreditRepository.findByCustomer_Id(customer.id) ?: return false
        if (credit.amount < amount) return false

        credit.amount = credit.amount.subtract(amount)
        refundCreditRepository.save(credit)
        refundCreditLogRepository.save(
            RefundCreditLog(customer = customer, amount = amount, type = RefundCreditLogType.SPENT, order = order, description = description)
        )
        return true
    }

    private fun creditToWallet(customer: User, amount: BigDecimal) {
        val credit = refundCreditRepository.findByCustomer_Id(customer.id)
            ?: RefundCredit(customer = customer, amount = BigDecimal.ZERO)
        credit.amount = credit.amount.add(amount)
        refundCreditRepository.save(credit)
    }
}