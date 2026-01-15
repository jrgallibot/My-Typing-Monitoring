package com.mytypingmonitor.location

import android.content.Context
import android.location.Location
import com.google.android.gms.location.*
import kotlinx.coroutines.tasks.await

class LocationHelper(private val context: Context) {
    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)
    
    private var cachedLocation: Location? = null
    private var lastLocationUpdate: Long = 0
    private val LOCATION_CACHE_DURATION = 5 * 60 * 1000L // 5 minutes

    suspend fun getCurrentLocation(): Pair<Double?, Double?> {
        val now = System.currentTimeMillis()
        
        // Return cached location if still valid
        if (cachedLocation != null && (now - lastLocationUpdate) < LOCATION_CACHE_DURATION) {
            return Pair(cachedLocation!!.latitude, cachedLocation!!.longitude)
        }

        return try {
            val location = fusedLocationClient.lastLocation.await()
            if (location != null) {
                cachedLocation = location
                lastLocationUpdate = now
                Pair(location.latitude, location.longitude)
            } else {
                Pair(null, null)
            }
        } catch (e: Exception) {
            Pair(null, null)
        }
    }

    fun clearCache() {
        cachedLocation = null
        lastLocationUpdate = 0
    }
}
