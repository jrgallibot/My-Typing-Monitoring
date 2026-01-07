# MyTypingMonitor

An Android application that logs typing activity through a custom keyboard (IME) with offline-first architecture, encryption, and automated report generation.

## Features

- **Custom Keyboard (IME)**: Logs all typing when the keyboard is active
- **Offline-First**: All data stored locally in SQLite (Room)
- **Encryption**: AES-256 encryption using Android Keystore
- **Location Tracking**: GPS location capture (battery-optimized with caching)
- **Analytics**: Typing statistics including speed, app usage, and activity patterns
- **PDF Reports**: Automatic PDF generation with encrypted logs
- **Scheduled Tasks**: WorkManager triggers at 12:00 PM and 12:00 AM
- **Internet-Aware**: Only sends reports when internet is available
- **No Server**: Completely offline, uses Gmail intent for sending

## Architecture

```
Typing → Custom Keyboard (IME) → Encrypt → SQLite → WorkManager → PDF → Notification → Gmail
```

## Tech Stack

- **Frontend**: React Native (TypeScript)
- **Backend**: Kotlin (Android Native)
- **Database**: Room (SQLite)
- **Encryption**: AES-256 with Android Keystore
- **Scheduling**: WorkManager
- **Location**: FusedLocationProvider
- **PDF**: Android PDF API
- **Notifications**: Android Notification API

## Setup

### Prerequisites

- Node.js >= 16
- Android Studio
- JDK 11+
- Android SDK (API 24+)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. For React Native dependencies:
```bash
cd android
./gradlew clean
```

3. Build the APK:
```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Configuration

### Permissions

The app requires the following permissions:
- `INTERNET` - For network checks
- `ACCESS_NETWORK_STATE` - To check internet availability
- `ACCESS_FINE_LOCATION` - For GPS location
- `ACCESS_COARSE_LOCATION` - For approximate location
- `BIND_INPUT_METHOD` - For custom keyboard
- `FOREGROUND_SERVICE` - For background tasks
- `RECEIVE_BOOT_COMPLETED` - To restart scheduled tasks

### Enabling the Keyboard

1. Install the APK
2. Open Android Settings → System → Languages & Input → Virtual Keyboard
3. Enable "MyTypingMonitor Keyboard"
4. Select it as your default keyboard or switch to it when needed

## Usage

### Dashboard

- View typing statistics
- See total characters, logs, typing speed
- View most used apps
- Check location count

### Logs

- View all typing logs
- See app context for each log
- View timestamps and locations
- Refresh to see latest entries

### Privacy

- Read privacy notice
- Understand data collection
- Learn about encryption

### Sending Reports

1. Manual: Tap "Send Logs Report" in Dashboard
2. Scheduled: Reports are generated at 12:00 PM and 12:00 AM
3. When internet is available, a notification appears
4. Tap notification to open Gmail with PDF attached

## Project Structure

```
MyTypingMonitor/
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/mytypingmonitor/
│   │   │   │   ├── ime/              # Custom keyboard
│   │   │   │   ├── db/               # Room database
│   │   │   │   ├── crypto/           # Encryption
│   │   │   │   ├── location/         # GPS tracking
│   │   │   │   ├── pdf/              # PDF generation
│   │   │   │   ├── analytics/        # Statistics
│   │   │   │   ├── worker/           # WorkManager
│   │   │   │   ├── notification/     # Notifications
│   │   │   │   └── bridge/           # React Native bridge
│   │   │   └── res/                  # Resources
│   │   └── build.gradle
│   └── build.gradle
├── src/
│   ├── screens/
│   │   ├── Dashboard.tsx
│   │   ├── Logs.tsx
│   │   └── Privacy.tsx
│   └── App.tsx
└── package.json
```

## Database Schema

```kotlin
@Entity(tableName = "typing_logs")
data class TypingLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val text: String,              // Encrypted text
    val appPackage: String,        // Foreground app
    val timestamp: Long,           // Unix timestamp
    val latitude: Double?,         // GPS latitude
    val longitude: Double?,        // GPS longitude
    val isSent: Boolean = false   // Sent status
)
```

## Security

- All logs encrypted with AES-256
- Encryption keys stored in Android Keystore
- No automatic data transmission
- User must explicitly send reports
- All data stored locally

## Limitations

- Secure input fields (passwords) may not be logged (Android security)
- Requires keyboard selection by user
- Not available on Google Play Store (IME logging policy)
- APK must be sideloaded

## Building for Release

1. Generate signing key (if needed):
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `android/app/build.gradle` with signing config

3. Build release APK:
```bash
cd android
./gradlew assembleRelease
```

## Troubleshooting

### Keyboard not appearing
- Check if keyboard is enabled in Settings
- Verify app has BIND_INPUT_METHOD permission
- Restart device

### Location not captured
- Grant location permissions
- Check GPS is enabled
- Location is cached (may take a few minutes)

### Reports not generating
- Check internet connection
- Verify WorkManager is scheduled
- Check notification permissions

## License

This project is for personal use only. Use responsibly and in compliance with local laws regarding data collection.

## Privacy Notice

MyTypingMonitor collects typing data only when the custom keyboard is active. All data is encrypted and stored locally. No data is transmitted without explicit user action. See the Privacy screen in the app for full details.


