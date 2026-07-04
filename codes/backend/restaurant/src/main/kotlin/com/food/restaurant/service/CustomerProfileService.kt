package com.food.restaurant.service

import com.food.restaurant.dto.user.CustomerProfileResponse
import com.food.restaurant.entity.user.User
import com.food.restaurant.repository.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CustomerProfileService(
    private val userRepository: UserRepository
) {

    fun toResponse(user: User): CustomerProfileResponse {
        return CustomerProfileResponse(
            firstName = user.firstName,
            lastName = user.lastName,
            username = user.username,
            email = user.email,
            phoneNumber = user.phoneNumber
        )
    }

    @Transactional
    fun updatePhoneNumber(user: User, phoneNumber: String?): CustomerProfileResponse {
        user.phoneNumber = phoneNumber?.trim()?.ifEmpty { null }
        val saved = userRepository.save(user)
        return toResponse(saved)
    }
}