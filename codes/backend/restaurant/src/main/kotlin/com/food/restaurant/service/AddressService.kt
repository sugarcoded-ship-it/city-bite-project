package com.food.restaurant.service

import com.food.restaurant.DTO.AddressRequest
import com.food.restaurant.DTO.AddressResponse
import com.food.restaurant.entity.user.Address
import com.food.restaurant.repository.AddressRepository
import com.food.restaurant.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AddressService(
    private val addressRepository: AddressRepository,
    private val userRepository: UserRepository
) {

    fun getCustomerAddresses(customerUuid: UUID): List<AddressResponse> {
        val addresses = addressRepository.findByCustomer_Id(customerUuid)

        return addresses.map { address ->
            AddressResponse(
                id = address.id,
                addressInfo = address.addressInfo,
                subDistrict = address.subDistrict,
                district = address.district,
                province = address.province,
                postalCode = address.postalCode
            )
        }
    }

    fun addNewAddress(customerUuid: UUID, request: AddressRequest): AddressResponse {
        val curAddrCount = addressRepository.countByCustomer_Id(customerUuid)
        if (curAddrCount >= 3){
            throw IllegalStateException("You can only save a maximum of 3 delivery addresses.")
        }

        val customer = userRepository.findById(customerUuid)
            .orElseThrow { IllegalArgumentException("Customer not found!") }

        val newAddr = Address(
            customer = customer,
            addressInfo = request.addressInfo,
            subDistrict = request.subDistrict,
            district = request.district,
            province = request.province,
            postalCode = request.postalCode
        )

        val savedAddr = addressRepository.save(newAddr)

        return AddressResponse(
            id = savedAddr.id,
            addressInfo = savedAddr.addressInfo,
            subDistrict = savedAddr.subDistrict,
            district = savedAddr.district,
            province = savedAddr.province,
            postalCode = savedAddr.postalCode
        )
    }
}