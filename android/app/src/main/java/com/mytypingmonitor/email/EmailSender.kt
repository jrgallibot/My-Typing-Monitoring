package com.mytypingmonitor.email

import android.util.Log
import java.util.Properties
import javax.mail.*
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeBodyPart
import javax.mail.internet.MimeMessage
import javax.mail.internet.MimeMultipart

import com.mytypingmonitor.BuildConfig

class EmailSender {
    companion object {
        private const val TAG = "EmailSender"
        
        // SMTP Configuration from BuildConfig (loaded from .env file)
        private val SMTP_HOST = BuildConfig.SMTP_HOST
        private val SMTP_PORT = BuildConfig.SMTP_PORT.toIntOrNull() ?: 587
        private val SMTP_USER = BuildConfig.SMTP_USER
        private val SMTP_PASSWORD = BuildConfig.SMTP_PASSWORD
        private val TO_EMAIL = BuildConfig.SMTP_TO_EMAIL
        private val FROM_EMAIL = BuildConfig.SMTP_FROM_EMAIL.ifBlank { SMTP_USER }
        private val USE_TLS = BuildConfig.SMTP_USE_TLS
        
        fun sendEmailWithAttachment(
            subject: String,
            body: String,
            attachmentPath: String?
        ): Boolean {
            return try {
                Log.d(TAG, "Starting email send...")
                Log.d(TAG, "SMTP Host: $SMTP_HOST")
                Log.d(TAG, "SMTP Port: $SMTP_PORT")
                Log.d(TAG, "From: $SMTP_USER")
                Log.d(TAG, "To: $TO_EMAIL")
                Log.d(TAG, "Attachment: $attachmentPath")
                val properties = Properties().apply {
                    put("mail.smtp.host", SMTP_HOST)
                    put("mail.smtp.port", SMTP_PORT.toString())
                    put("mail.smtp.auth", "true")
                    put("mail.smtp.starttls.enable", USE_TLS.toString())
                    put("mail.smtp.starttls.required", USE_TLS.toString())
                    put("mail.smtp.ssl.trust", SMTP_HOST)
                    put("mail.smtp.connectiontimeout", "30000")
                    put("mail.smtp.timeout", "30000")
                    put("mail.smtp.writetimeout", "30000")
                    put("mail.debug", "false")
                }
                
                Log.d(TAG, "Creating SMTP session...")
                val session = Session.getInstance(properties, object : Authenticator() {
                    override fun getPasswordAuthentication(): PasswordAuthentication {
                        Log.d(TAG, "Authenticating with SMTP...")
                        return PasswordAuthentication(SMTP_USER, SMTP_PASSWORD)
                    }
                })
                Log.d(TAG, "SMTP session created")
                
                Log.d(TAG, "Creating email message...")
                val message = MimeMessage(session).apply {
                    setFrom(InternetAddress(FROM_EMAIL))
                    replyTo = arrayOf(InternetAddress(SMTP_USER))
                    setRecipients(Message.RecipientType.TO, InternetAddress.parse(TO_EMAIL, false))
                    setSubject(subject)
                }
                Log.d(TAG, "Message created: From=$FROM_EMAIL, To=$TO_EMAIL, Subject=$subject")
                
                val multipart = MimeMultipart()
                
                // Add body
                Log.d(TAG, "Adding email body...")
                val bodyPart = MimeBodyPart().apply {
                    setText(body, "utf-8")
                }
                multipart.addBodyPart(bodyPart)
                
                // Add attachment if provided
                if (attachmentPath != null) {
                    try {
                        val file = java.io.File(attachmentPath)
                        Log.d(TAG, "Checking attachment file: ${file.absolutePath}, exists: ${file.exists()}, size: ${file.length()}")
                        if (file.exists()) {
                            Log.d(TAG, "Attaching file: ${file.name}")
                            val attachmentPart = MimeBodyPart().apply {
                                val dataSource = javax.activation.FileDataSource(file)
                                setDataHandler(javax.activation.DataHandler(dataSource))
                                fileName = file.name
                            }
                            multipart.addBodyPart(attachmentPart)
                            Log.d(TAG, "File attached successfully")
                        } else {
                            Log.w(TAG, "Attachment file does not exist: $attachmentPath")
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error attaching file: ${e.message}", e)
                        // Continue without attachment
                    }
                }
                
                message.setContent(multipart)
                Log.d(TAG, "Sending email via Transport.send()...")
                
                Transport.send(message)
                Log.d(TAG, "Email sent successfully")
                true
            } catch (e: Exception) {
                Log.e(TAG, "Error sending email: ${e.message}", e)
                Log.e(TAG, "Error type: ${e.javaClass.simpleName}")
                e.printStackTrace()
                false
            }
        }
        
        fun sendEmail(
            subject: String,
            body: String
        ): Boolean {
            return sendEmailWithAttachment(subject, body, null)
        }
    }
}


