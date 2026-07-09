package com.food.restaurant.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient

@Service
class RoutingService(
    @Value("\${google.maps.api-key:}") private val apiKey: String
) {
    private val log = LoggerFactory.getLogger(RoutingService::class.java)
    private val restClient = RestClient.create()

    data class RoutesResponse(val routes: List<RouteInfo> = emptyList())
    data class RouteInfo(val duration: String? = null)

    fun travelSeconds(originLat: Double, originLng: Double, destLat: Double, destLng: Double): Int? {
        if (apiKey.isBlank()) {
            log.warn("google.maps.api-key is not set - skipping routing.")
            return null
        }
        val requestBody = mapOf(
            "origin" to mapOf("location" to mapOf("latLng" to mapOf("latitude" to originLat, "longitude" to originLng))),
            "destination" to mapOf("location" to mapOf("latLng" to mapOf("latitude" to destLat, "longitude" to destLng))),
            "travelMode" to "TWO_WHEELER"
        )
        return try {
            val resp = restClient.post()
                .uri("https://routes.googleapis.com/directions/v2:computeRoutes")
                .header("Content-Type", "application/json")
                .header("X-Goog-Api-Key", apiKey)
                .header("X-Goog-FieldMask", "routes.duration")
                .body(requestBody)
                .retrieve()
                .body(RoutesResponse::class.java)

            resp?.routes?.firstOrNull()?.duration?.removeSuffix("s")?.toIntOrNull()
        } catch (e: Exception) {
            log.error("Routes API call failed: {}", e.message)
            null
        }
    }
}