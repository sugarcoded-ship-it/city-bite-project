package com.food.restaurant.service.address

import com.food.restaurant.dto.address.AddressRequest
import com.food.restaurant.dto.address.AddressResponse
import com.food.restaurant.entity.address.Address
import com.food.restaurant.repository.address.AddressRepository
import com.food.restaurant.repository.user.UserRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AddressService(
    private val addressRepository: AddressRepository,
    private val userRepository: UserRepository,
    private val geocodingService: GeocodingService
) {

    fun getCustomerAddresses(customerUuid: UUID): List<AddressResponse> {
        val addresses = addressRepository.findByCustomer_IdAndActiveTrue(customerUuid)

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

    @Transactional
    fun addNewAddress(customerUuid: UUID, request: AddressRequest): AddressResponse {
        val curAddrCount = addressRepository.countByCustomer_IdAndActiveTrue(customerUuid)
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

        geocodingService.geocode(
            request.addressInfo, request.subDistrict, request.district, request.province, request.postalCode
        )?.let { newAddr.latitude = it.lat; newAddr.longitude = it.lng }

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

    @Transactional
    fun editAddress(customerUuid: UUID, addressId: Int, request: AddressRequest): AddressResponse {
        val existingAddr = addressRepository.findById(addressId)
            .orElseThrow { IllegalArgumentException("Address not found!") }

        if (existingAddr.customer.id != customerUuid) {
            throw IllegalStateException("You do not have permission to edit this address.")
        }

        existingAddr.addressInfo = request.addressInfo
        existingAddr.subDistrict = request.subDistrict
        existingAddr.district = request.district
        existingAddr.province = request.province
        existingAddr.postalCode = request.postalCode

        geocodingService.geocode(
            request.addressInfo, request.subDistrict, request.district, request.province, request.postalCode
        )?.let { existingAddr.latitude = it.lat; existingAddr.longitude = it.lng }

        val updatedAddr = addressRepository.save(existingAddr)

        return AddressResponse(
            id = updatedAddr.id,
            addressInfo = updatedAddr.addressInfo,
            subDistrict = updatedAddr.subDistrict,
            district = updatedAddr.district,
            province = updatedAddr.province,
            postalCode = updatedAddr.postalCode
        )
    }


    @Transactional
    fun deleteAddress(customerUuid: UUID, addressId: Int) {
        val existingAddr = addressRepository.findById(addressId)
            .orElseThrow { IllegalArgumentException("Address not found!") }

        if (existingAddr.customer.id != customerUuid) {
            throw IllegalStateException("You do not have permission to delete this address.")
        }

        existingAddr.active = false
    }
}