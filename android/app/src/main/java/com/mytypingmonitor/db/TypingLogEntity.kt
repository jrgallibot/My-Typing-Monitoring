package com.mytypingmonitor.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "typing_logs")
data class TypingLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val text: String,
    val appPackage: String,
    val timestamp: Long,
    val latitude: Double?,
    val longitude: Double?,
    val isSent: Boolean = false
)
