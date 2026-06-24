package com.food.restaurant.service

import com.food.restaurant.entity.payment.RefundCredit
import com.food.restaurant.entity.user.User
import com.food.restaurant.repository.payment.RefundCreditRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.util.UUID

@Service
class RefundCreditService(
    private val refundCreditRepository: RefundCreditRepository
) {

    fun getBalance (customerUuid : UUID): BigDecimal {
        val credit = refundCreditRepository.findByCustomer_Id(customerUuid)
        return credit.amount ?: BigDecimal.ZERO
    }

    @Transactional
    fun addCredit(user: User, amount: BigDecimal){
        val credit = refundCreditRepository.findByCustomer_Id(user.id)
            ?: RefundCredit(customer = user, amount = BigDecimal.ZERO)

        credit.amount += amount
        refundCreditRepository.save(credit)
    }

    @Transactional
    fun useCredit(user: User, amountToUse: BigDecimal): Boolean {
        val credit = refundCreditRepository.findByCustomer_Id(user.id) ?: return false

        if (credit.amount >= amountToUse) {
            credit.amount -= amountToUse
            refundCreditRepository.save(credit)
            return true
        }
        return false
    }
}