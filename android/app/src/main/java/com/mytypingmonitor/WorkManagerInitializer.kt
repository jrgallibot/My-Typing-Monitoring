package com.mytypingmonitor

import android.content.Context
import androidx.work.*
import com.mytypingmonitor.worker.EmailTriggerWorker
import java.util.concurrent.TimeUnit
import java.util.Calendar

object WorkManagerInitializer {
    private const val SYNC_WORK_NAME = "email_sync_when_online"
    private const val SYNC_TRIGGER_TAG = "sync_trigger"

    fun scheduleEmailTasks(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val workManager = WorkManager.getInstance(context)

        // Schedule for 12:00 PM (noon)
        scheduleNoonTask(workManager, constraints)
        
        // Schedule for 12:00 AM (midnight)
        scheduleMidnightTask(workManager, constraints)

        scheduleEmailSyncWhenOnline(context)
    }

    fun scheduleEmailSyncWhenOnline(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncWork = OneTimeWorkRequestBuilder<EmailTriggerWorker>()
            .setConstraints(constraints)
            .setInitialDelay(15, TimeUnit.MINUTES)
            .addTag(SYNC_TRIGGER_TAG)
            .setInputData(Data.Builder().putString("tag", SYNC_TRIGGER_TAG).build())
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            SYNC_WORK_NAME,
            ExistingWorkPolicy.KEEP,
            syncWork
        )
    }

    private fun scheduleNoonTask(workManager: WorkManager, constraints: Constraints) {
        val delay = calculateDelayToNoon()
        
        val noonWork = OneTimeWorkRequestBuilder<EmailTriggerWorker>()
            .setConstraints(constraints)
            .setInitialDelay(delay, TimeUnit.MILLISECONDS)
            .addTag("noon_trigger")
            .setInputData(Data.Builder().putString("tag", "noon_trigger").build())
            .build()

        workManager.enqueueUniqueWork(
            "email_trigger_noon",
            ExistingWorkPolicy.REPLACE,
            noonWork
        )
    }

    private fun scheduleMidnightTask(workManager: WorkManager, constraints: Constraints) {
        val delay = calculateDelayToMidnight()
        
        val midnightWork = OneTimeWorkRequestBuilder<EmailTriggerWorker>()
            .setConstraints(constraints)
            .setInitialDelay(delay, TimeUnit.MILLISECONDS)
            .addTag("midnight_trigger")
            .setInputData(Data.Builder().putString("tag", "midnight_trigger").build())
            .build()

        workManager.enqueueUniqueWork(
            "email_trigger_midnight",
            ExistingWorkPolicy.REPLACE,
            midnightWork
        )
    }

    fun calculateDelayToNoon(): Long {
        val calendar = Calendar.getInstance()
        val now = calendar.timeInMillis
        
        calendar.set(Calendar.HOUR_OF_DAY, 12)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        
        var noon = calendar.timeInMillis
        if (noon <= now) {
            calendar.add(Calendar.DAY_OF_MONTH, 1)
            noon = calendar.timeInMillis
        }
        
        return noon - now
    }

    fun calculateDelayToMidnight(): Long {
        val calendar = Calendar.getInstance()
        val now = calendar.timeInMillis
        
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        
        var midnight = calendar.timeInMillis
        if (midnight <= now) {
            calendar.add(Calendar.DAY_OF_MONTH, 1)
            midnight = calendar.timeInMillis
        }
        
        return midnight - now
    }
}

