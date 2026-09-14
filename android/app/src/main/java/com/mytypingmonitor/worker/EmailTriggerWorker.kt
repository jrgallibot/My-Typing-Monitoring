package com.mytypingmonitor.worker

import android.content.Context
import android.util.Log
import androidx.work.*
import com.mytypingmonitor.WorkManagerInitializer
import com.mytypingmonitor.db.AppDatabase
import com.mytypingmonitor.email.EmailSender
import com.mytypingmonitor.pdf.PdfGenerator
import com.mytypingmonitor.crypto.CryptoHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

class EmailTriggerWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    companion object {
        private const val TAG = "EmailTriggerWorker"
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "=========================================")
            Log.d(TAG, "EmailTriggerWorker started")
            Log.d(TAG, "Worker ID: ${id}")
            Log.d(TAG, "Tag: ${inputData.getString("tag")}")
            Log.d(TAG, "=========================================")
            
            val triggerTag = inputData.getString("tag")
            if (triggerTag == "manual_trigger") {
                Log.d(TAG, "Manual email trigger requested")
            } else if (triggerTag == "sync_trigger") {
                Log.d(TAG, "Online sync email trigger requested")
            }
            
            val database = AppDatabase.getDatabase(applicationContext)
            val cryptoHelper = CryptoHelper(applicationContext)
            val dao = database.typingLogDao()
            
            // Check if there are unsent logs
            val unsentCount = dao.getUnsentCount()
            Log.d(TAG, "Unsent logs count: $unsentCount")
            
            if (unsentCount == 0) {
                Log.d(TAG, "No unsent logs, rescheduling next run")
                rescheduleNextRun()
                return@withContext Result.success()
            }
            
            // Generate PDF report
            Log.d(TAG, "Generating PDF report...")
            val pdfGenerator = PdfGenerator(applicationContext, database, cryptoHelper)
            val pdfFile = pdfGenerator.generateReport()
            Log.d(TAG, "PDF generated: ${pdfFile.absolutePath}")
            
            // Send email with PDF attachment
            val subject = "MyTypingMonitor - Typing Logs Report"
            val body = """
                Typing Logs Report
        
                Total unsent logs: $unsentCount
                Report generated at: ${java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())}
        
                Please find the encrypted PDF report attached.
            """.trimIndent()
            
            Log.d(TAG, "Sending email...")
            val emailSent = EmailSender.sendEmailWithAttachment(
                subject = subject,
                body = body,
                attachmentPath = pdfFile.absolutePath
            )
            
            if (emailSent) {
                Log.d(TAG, "Email sent successfully")
                // Mark logs as sent
                val unsentLogs = dao.getRecentLogs(10000).filter { !it.isSent }
                if (unsentLogs.isNotEmpty()) {
                    dao.markAsSent(unsentLogs.map { it.id })
                }
            } else {
                Log.e(TAG, "Failed to send email")
                // Reschedule to retry later
                rescheduleNextRun()
                return@withContext Result.retry()
            }
            
            // Reschedule for next time
            rescheduleNextRun()
            
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error in EmailTriggerWorker: ${e.message}", e)
            rescheduleNextRun()
            Result.retry()
        }
    }

    private fun rescheduleNextRun() {
        val tag = inputData.getString("tag") ?: return
        if (tag == "manual_trigger" || tag == "sync_trigger") {
            WorkManagerInitializer.scheduleEmailTasks(applicationContext)
            Log.d(TAG, "$tag worker completed; regular email tasks are scheduled")
            return
        }

        val isNoon = tag == "noon_trigger"
        
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        
        val delay = if (isNoon) {
            WorkManagerInitializer.calculateDelayToNoon()
        } else {
            WorkManagerInitializer.calculateDelayToMidnight()
        }
        
        val nextWork = OneTimeWorkRequestBuilder<EmailTriggerWorker>()
            .setConstraints(constraints)
            .setInitialDelay(delay, TimeUnit.MILLISECONDS)
            .addTag(tag)
            .setInputData(Data.Builder().putString("tag", tag).build())
            .build()
        
        val workName = if (isNoon) "email_trigger_noon" else "email_trigger_midnight"
        WorkManager.getInstance(applicationContext).enqueueUniqueWork(
            workName,
            ExistingWorkPolicy.REPLACE,
            nextWork
        )
        
        Log.d(TAG, "Rescheduled $workName with delay: ${delay / 1000 / 60} minutes")
    }
}

