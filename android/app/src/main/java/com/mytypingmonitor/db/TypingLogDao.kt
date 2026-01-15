package com.mytypingmonitor.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TypingLogDao {
    @Query("SELECT * FROM typing_logs WHERE isSent = 0 ORDER BY timestamp DESC")
    fun getUnsentLogs(): Flow<List<TypingLogEntity>>

    @Query("SELECT * FROM typing_logs ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecentLogs(limit: Int): List<TypingLogEntity>

    @Query("SELECT * FROM typing_logs WHERE timestamp >= :startTime AND timestamp <= :endTime ORDER BY timestamp DESC")
    suspend fun getLogsInRange(startTime: Long, endTime: Long): List<TypingLogEntity>

    @Query("SELECT COUNT(*) FROM typing_logs WHERE isSent = 0")
    suspend fun getUnsentCount(): Int

    @Query("SELECT COUNT(*) FROM typing_logs")
    suspend fun getTotalCount(): Int

    @Query("SELECT SUM(LENGTH(text)) FROM typing_logs")
    suspend fun getTotalCharacters(): Long?

    @Query("SELECT appPackage, COUNT(*) as count FROM typing_logs GROUP BY appPackage ORDER BY count DESC LIMIT 10")
    suspend fun getMostUsedApps(): List<AppUsage>

    @Insert
    suspend fun insertLog(log: TypingLogEntity): Long

    @Update
    suspend fun updateLog(log: TypingLogEntity)

    @Query("UPDATE typing_logs SET isSent = 1 WHERE id IN (:ids)")
    suspend fun markAsSent(ids: List<Long>)

    @Query("DELETE FROM typing_logs WHERE isSent = 1 AND timestamp < :beforeTimestamp")
    suspend fun deleteOldSentLogs(beforeTimestamp: Long)
}

data class AppUsage(
    val appPackage: String,
    val count: Int
)
