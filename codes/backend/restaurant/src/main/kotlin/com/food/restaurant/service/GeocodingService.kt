package com.food.restaurant.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient

@Service
class GeocodingService(
    @Value("\${google.maps.api-key:}") private val apiKey: String
) {
    private val log = LoggerFactory.getLogger(GeocodingService::class.java)
    private val restClient = RestClient.create()

    data class LatLng(val lat: Double, val lng: Double)

    data class GeocodeResponse(val status: String? = null, val results: List<GeoResult> = emptyList())
    data class GeoResult(val geometry: Geometry? = null)
    data class Geometry(val location: GeoLocation? = null)
    data class GeoLocation(val lat: Double = 0.0, val lng: Double = 0.0)

    fun geocode(vararg parts: String?): LatLng? {
        if (apiKey.isBlank()) {
            log.warn("google.maps.api-key is not set - skipping geocoding.")
            return null
        }
        val query = (parts.filter { !it.isNullOrBlank() } + "Thailand").joinToString(", ")
        return try {
            val resp = restClient.get()
                .uri("https://maps.googleapis.com/maps/api/geocode/json?address={addr}&key={key}", query, apiKey)
                .retrieve()
                .body(GeocodeResponse::class.java)

            val loc = resp?.results?.firstOrNull()?.geometry?.location
            if (resp?.status == "OK" && loc != null) {
                LatLng(loc.lat, loc.lng)
            } else {
                log.warn("Geocoding returned status='{}' for '{}'", resp?.status, query)
                null
            }
        } catch (e: Exception) {
            log.error("Geocoding failed for '{}': {}", query, e.message)
            null
        }
    }
}