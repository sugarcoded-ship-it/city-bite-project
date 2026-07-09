package com.food.restaurant.service.order
import com.food.restaurant.service.store.StoreService
import com.food.restaurant.service.address.RoutingService

import com.food.restaurant.dto.order.EtaResponse
import com.food.restaurant.repository.order.OrderSummaryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import kotlin.math.ceil

@Service
class OrderETAService(
    private val orderRepository: OrderSummaryRepository,
    private val routingService: RoutingService,
    private val storeService: StoreService
) {
    companion object {
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

        val store = storeService.getGlobalStore()
            ?: return EtaResponse(orderId, available = false, message = "No store configured yet.", prepMinutes = PREP_MINUTES, status = status)
        val storeLat = store.latitude
        val storeLng = store.longitude
        if (storeLat == null || storeLng == null) {
            return EtaResponse(orderId, available = false,
                message = "The store location hasn't been geocoded yet.", prepMinutes = PREP_MINUTES, status = status)
        }

        if (lat == null || lng == null) {
            return EtaResponse(
                orderId = orderId,
                available = false,
                message = "This delivery address has no map coordinates yet. Re-save the address to enable ETA.",
                prepMinutes = PREP_MINUTES,
                status = status
            )
        }

        val seconds = routingService.travelSeconds(storeLat, storeLng, lat, lng)
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