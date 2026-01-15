package com.mytypingmonitor.pdf

import android.content.Context
import android.graphics.pdf.PdfDocument
import android.os.Environment
import com.mytypingmonitor.analytics.AnalyticsEngine
import com.mytypingmonitor.crypto.CryptoHelper
import com.mytypingmonitor.db.AppDatabase
import com.mytypingmonitor.db.TypingLogEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

class PdfGenerator(
    private val context: Context,
    private val database: AppDatabase,
    private val cryptoHelper: CryptoHelper
) {
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
    private val dateFormatFile = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())

    suspend fun generateReport(startTime: Long? = null, endTime: Long? = null): File = withContext(Dispatchers.IO) {
        val dao = database.typingLogDao()
        val analytics = AnalyticsEngine(database)
        
        val logs = if (startTime != null && endTime != null) {
            dao.getLogsInRange(startTime, endTime)
        } else {
            dao.getRecentLogs(10000)
        }
        
        val stats = analytics.computeStats(startTime, endTime)
        
        val document = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 size
        val page = document.startPage(pageInfo)
        val canvas = page.canvas
        
        val paint = android.graphics.Paint().apply {
            color = android.graphics.Color.BLACK
            textSize = 12f
        }
        
        val titlePaint = android.graphics.Paint().apply {
            color = android.graphics.Color.BLACK
            textSize = 18f
            isFakeBoldText = true
        }
        
        var y = 50f
        val margin = 40f
        val lineHeight = 20f
        val pageHeight = 842f
        var currentPage = 1
        
        // Title
        canvas.drawText("Typing Logs Report", margin, y, titlePaint)
        y += lineHeight * 2
        
        // Date range
        val dateRange = if (startTime != null && endTime != null) {
            "${dateFormat.format(Date(startTime))} - ${dateFormat.format(Date(endTime))}"
        } else {
            "All Time"
        }
        canvas.drawText("Date Range: $dateRange", margin, y, paint)
        y += lineHeight * 2
        
        // Statistics
        canvas.drawText("Statistics:", margin, y, titlePaint)
        y += lineHeight
        canvas.drawText("Total Characters: ${stats.totalChars}", margin, y, paint)
        y += lineHeight
        canvas.drawText("Total Logs: ${stats.totalLogs}", margin, y, paint)
        y += lineHeight
        canvas.drawText("Characters per Minute: ${stats.charsPerMinute}", margin, y, paint)
        y += lineHeight
        canvas.drawText("Most Used App: ${stats.mostUsedApp ?: "N/A"} (${stats.mostUsedAppCount} logs)", margin, y, paint)
        y += lineHeight
        canvas.drawText("Unique Locations: ${stats.uniqueLocations}", margin, y, paint)
        y += lineHeight * 2
        
        // Logs
        canvas.drawText("Typing Logs:", margin, y, titlePaint)
        y += lineHeight
        
        for (log in logs) {
            if (y > pageHeight - 100) {
                document.finishPage(page)
                currentPage++
                val newPageInfo = PdfDocument.PageInfo.Builder(595, 842, currentPage).create()
                val newPage = document.startPage(newPageInfo)
                canvas.setBitmap(newPage.canvas)
                y = 50f
            }
            
            val decryptedText = try {
                cryptoHelper.decrypt(log.text)
            } catch (e: Exception) {
                "[Encrypted]"
            }
            
            val timestamp = dateFormat.format(Date(log.timestamp))
            val location = if (log.latitude != null && log.longitude != null) {
                "(${log.latitude}, ${log.longitude})"
            } else {
                "N/A"
            }
            
            canvas.drawText("[$timestamp] $decryptedText", margin, y, paint)
            y += lineHeight
            canvas.drawText("  App: ${log.appPackage} | Location: $location", margin, y, paint)
            y += lineHeight * 1.5f
        }
        
        document.finishPage(page)
        
        // Save to file
        val fileName = "typing_logs_${dateFormatFile.format(Date())}.pdf"
        val documentsDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
            ?: context.getExternalFilesDir(null)
        val file = File(documentsDir, fileName)
        file.parentFile?.mkdirs()
        
        FileOutputStream(file).use { out ->
            document.writeTo(out)
        }
        document.close()
        
        file
    }
}

