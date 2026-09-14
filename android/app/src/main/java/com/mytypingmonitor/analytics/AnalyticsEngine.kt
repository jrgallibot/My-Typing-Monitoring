package com.mytypingmonitor.analytics

import com.mytypingmonitor.db.AppDatabase
import com.mytypingmonitor.db.TypingLogEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class TypingStats(
    val totalChars: Long,
    val totalLogs: Int,
    val charsPerMinute: Int,
    val mostUsedApp: String?,
    val mostUsedAppCount: Int,
    val activeHours: Map<Int, Int>, // hour -> count
    val uniqueLocations: Int
)

class AnalyticsEngine(private val database: AppDatabase) {
    
    suspend fun computeStats(startTime: Long? = null, endTime: Long? = null): TypingStats = withContext(Dispatchers.IO) {
        val dao = database.typingLogDao()
        
        val totalChars = dao.getTotalCharacters()
        val totalLogs = dao.getTotalCount()
        val mostUsedApps = dao.getMostUsedApps()
        val mostUsedApp = mostUsedApps.firstOrNull()?.appPackage
        val mostUsedAppCount = mostUsedApps.firstOrNull()?.count ?: 0
        
        // Calculate typing speed (chars per minute)
        val logs = if (startTime != null && endTime != null) {
            dao.getLogsInRange(startTime, endTime)
        } else {
            dao.getRecentLogs(10000)
        }
        
        val activeMinutes = if (logs.isNotEmpty()) {
            val timeSpan = (logs.first().timestamp - logs.last().timestamp) / 1000 / 60
            maxOf(1, timeSpan)
        } else {
            1
        }
        
        val charsPerMinute = if (logs.isNotEmpty()) {
            (logs.sumOf { it.text.length } / activeMinutes).toInt()
        } else {
            0
        }
        
        // Calculate active hours
        val activeHours = logs.groupBy { 
            java.util.Calendar.getInstance().apply {
                timeInMillis = it.timestamp
            }.get(java.util.Calendar.HOUR_OF_DAY)
        }.mapValues { it.value.size }
        
        // Count unique locations
        val uniqueLocations = logs.filter { it.latitude != null && it.longitude != null }
            .map { "${it.latitude},${it.longitude}" }
            .distinct()
            .size
        
        TypingStats(
            totalChars = totalChars,
            totalLogs = totalLogs,
            charsPerMinute = charsPerMinute,
            mostUsedApp = mostUsedApp,
            mostUsedAppCount = mostUsedAppCount,
            activeHours = activeHours,
            uniqueLocations = uniqueLocations
        )
    }
}
