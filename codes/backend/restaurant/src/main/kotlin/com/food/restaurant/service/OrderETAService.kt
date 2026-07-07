package com.food.restaurant.service

import com.food.restaurant.dto.EtaResponse
import com.food.restaurant.repository.order.OrderSummaryRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import kotlin.math.ceil

@Service
class OrderETAService(
    private val orderRepository: OrderSummaryRepository,
    private val routingService: RoutingService,
) {
    companion object {
        private const val STORE_LAT = 13.7969
        private const val STORE_LONG = 100.3232
        private const val PREP_MINUTES = 15
        private const val ETA_BUFFER_MINUTES = 10
    }


    @Transactional(readOnly = true)
    fun getEta(orderId: Int, requesterUuid: UUID): EtaResponse {
        val order = orderRepository.findById(orderId)
            .orElseThrow { IllegalArgumentException("Order not found with ID: $orderId") }

        if (order.customer.id != requesterUuid) {
            throw IllegalStateException("You do not have permission to view this order.")
        }

        val status = order.orderStatus.statusName.name
        val lat = order.address.latitude
        val lng = order.address.longitude

        if (lat == null || lng == null) {
            return EtaResponse(
                orderId = orderId,
                available = false,
                message = "This delivery address has no map coordinates yet. Re-save the address to enable ETA.",
                prepMinutes = PREP_MINUTES,
                status = status
            )
        }

        val seconds = routingService.travelSeconds(STORE_LAT, STORE_LONG, lat, lng)
            ?: return EtaResponse(
                orderId = orderId,
                available = false,
                message = "Couldn't reach the map service to estimate travel time. Try again shortly.",
                prepMinutes = PREP_MINUTES,
                status = status
            )

        val travelMinutes = ceil(seconds / 60.0).toInt()
        val arrival = order.createdAt.plusMinutes((PREP_MINUTES + travelMinutes).toLong())
        val etaTo = arrival.plusMinutes(ETA_BUFFER_MINUTES.toLong())

        return EtaResponse(
            orderId = orderId,
            available = true,
            prepMinutes = PREP_MINUTES,
            travelMinutes = travelMinutes,
            etaFrom = arrival.toString(),
            etaTo = etaTo.toString(),
            status = status
        )
    }
}