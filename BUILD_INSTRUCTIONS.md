# MyTypingMonitor - Build Instructions

## Prerequisites

1. **Node.js** (>= 16)
   ```bash
   node --version
   ```

2. **Java Development Kit (JDK)** (11 or higher)
   ```bash
   java -version
   ```

3. **Android Studio** with Android SDK
   - Install Android SDK Platform 33
   - Install Android SDK Build-Tools 33.0.0
   - Set ANDROID_HOME environment variable

4. **React Native CLI** (optional, for development)
   ```bash
   npm install -g react-native-cli
   ```

## Installation Steps

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or using yarn
yarn install
```

### 2. Android Setup

```bash
cd android

# Clean previous builds
./gradlew clean

# Verify Gradle setup
./gradlew tasks
```

### 3. Build Release APK

```bash
# From android directory
./gradlew assembleRelease

# Or from project root
cd android && ./gradlew assembleRelease
```

### 4. Locate APK

The release APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installation on Device

### Method 1: ADB (Android Debug Bridge)

```bash
# Enable USB debugging on your Android device
# Connect device via USB
adb devices

# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Method 2: Direct Transfer

1. Copy `app-release.apk` to your Android device
2. On device: Settings → Security → Enable "Install from Unknown Sources"
3. Open the APK file using a file manager
4. Tap "Install"

## Post-Installation Setup

### 1. Enable Keyboard

1. Open Android Settings
2. Go to **System** → **Languages & Input** → **Virtual Keyboard**
3. Tap **Manage Keyboards**
4. Enable **MyTypingMonitor Keyboard**

### 2. Select Keyboard

1. Open any text input field
2. Tap the keyboard icon in the notification bar
3. Select **MyTypingMonitor Keyboard**

Or:

1. Go to **Settings** → **System** → **Languages & Input** → **On-screen Keyboard**
2. Select **MyTypingMonitor Keyboard** as default

### 3. Grant Permissions

The app will request:
- **Location Permission** - For GPS tracking
- **Notification Permission** - For report notifications

Grant these when prompted.

## Development Build

For development with hot reload:

```bash
# Start Metro bundler
npm start

# In another terminal, run on device
npm run android

# Or build and install manually
cd android
./gradlew installDebug
```

## Troubleshooting

### Build Errors

**Error: SDK location not found**
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS/Linux
# or
set ANDROID_HOME=C:\Users\YourUser\AppData\Local\Android\Sdk  # Windows
```

**Error: Gradle daemon**
```bash
cd android
./gradlew --stop
./gradlew clean
```

**Error: Room annotation processor**
- Ensure `kapt` plugin is applied in `android/app/build.gradle`
- Clean and rebuild: `./gradlew clean assembleRelease`

### Runtime Issues

**Keyboard not appearing**
- Verify keyboard is enabled in Settings
- Restart device
- Check app has BIND_INPUT_METHOD permission

**Location not captured**
- Grant location permissions in app settings
- Enable GPS on device
- Location is cached (may take 5 minutes to update)

**Reports not generating**
- Check internet connection (required for WorkManager)
- Verify WorkManager is scheduled (check logs)
- Ensure notification permissions are granted

## Signing APK for Distribution

### Generate Keystore

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Update build.gradle

Add to `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file('my-release-key.keystore')
        storePassword 'your-password'
        keyAlias 'my-key-alias'
        keyPassword 'your-password'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### Build Signed APK

```bash
cd android
./gradlew assembleRelease
```

## File Structure

```
MyTypingMonitor/
├── android/
│   ├── app/
│   │   ├── build.gradle          # App-level Gradle config
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/mytypingmonitor/
│   │   │   └── res/
│   │   └── build/outputs/apk/release/  # APK output
│   └── build.gradle              # Project-level Gradle config
├── src/                          # React Native source
├── package.json
└── README.md
```

## Key Components

- **IME Service**: `android/app/src/main/java/com/mytypingmonitor/ime/MyKeyboardService.kt`
- **Database**: Room (SQLite) - `db/` package
- **Encryption**: AES-256 - `crypto/CryptoHelper.kt`
- **WorkManager**: Scheduled tasks - `worker/EmailTriggerWorker.kt`
- **PDF Generator**: `pdf/PdfGenerator.kt`
- **React Native Bridge**: `bridge/TypingMonitorModule.kt`

## Notes

- APK size: ~15-20 MB (release build)
- Minimum Android version: API 24 (Android 7.0)
- Target Android version: API 33 (Android 13)
- Not available on Google Play Store (IME logging policy)
- Must be sideloaded for installation

