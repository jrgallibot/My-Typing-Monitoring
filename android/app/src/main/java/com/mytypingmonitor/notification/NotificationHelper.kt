package com.mytypingmonitor.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.mytypingmonitor.MainActivity
import java.io.File

class NotificationHelper(private val context: Context) {
    private val channelId = "typing_monitor_channel"
    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Typing Monitor",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notifications for typing logs"
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun showLogsReadyNotification(pdfPath: String) {
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        val pdfFile = File(pdfPath)
        if (!pdfFile.exists()) {
            return
        }

        // Use FileProvider for Android 10+
        val pdfUri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                pdfFile
            )
        } else {
            Uri.fromFile(pdfFile)
        }

        // Create Gmail intent
        val gmailIntent = Intent(Intent.ACTION_SEND).apply {
            setPackage("com.google.android.gm")
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, pdfUri)
            putExtra(Intent.EXTRA_SUBJECT, "Typing Logs Report")
            putExtra(Intent.EXTRA_TEXT, "Typing logs report attached.")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        
        // Fallback intent for other email apps
        val fallbackIntent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, pdfUri)
            putExtra(Intent.EXTRA_SUBJECT, "Typing Logs Report")
            putExtra(Intent.EXTRA_TEXT, "Typing logs report attached.")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        
        // Create chooser with Gmail as preferred option
        val chooserIntent = Intent.createChooser(fallbackIntent, "Send logs via Gmail")
        chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(gmailIntent))
        chooserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            chooserIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_email)
            .setContentTitle("Typing Report Ready")
            .setContentText("Tap to send encrypted PDF via Gmail")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(1, notification)
    }
}

