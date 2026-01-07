# Build Solutions for MyTypingMonitor

## Current Issue
- No Android device/emulator connected
- Gradle wrapper missing
- Need to build APK

## Solution 1: Use Expo Prebuild + Build (Recommended)

Expo will generate the gradle wrapper automatically:

```powershell
# 1. Prebuild (generates gradle wrapper and configures native projects)
npx expo prebuild

# 2. Build APK
cd android
.\gradlew.bat assembleDebug

# APK will be at: android\app\build\outputs\apk\debug\app-debug.apk
```

## Solution 2: Use EAS Build (Cloud - No Local Setup)

Build in the cloud without needing local Android setup:

```powershell
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS (first time)
eas build:configure

# 4. Build development APK
eas build --profile development --platform android

# 5. Download APK from the URL provided
# 6. Install on your device
```

## Solution 3: Setup Android Studio + Emulator

### Step 1: Install Android Studio
1. Download: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio

### Step 2: Create Emulator
1. Tools → Device Manager
2. Create Device → Select Pixel 5
3. Download system image (Android 13)
4. Finish

### Step 3: Start Emulator
1. Click Play button in Device Manager
2. Wait for emulator to boot

### Step 4: Run Expo
```powershell
npx expo run:android
```

## Solution 4: Connect Physical Device

### Step 1: Enable Developer Mode
1. Settings → About Phone
2. Tap Build Number 7 times

### Step 2: Enable USB Debugging
1. Settings → Developer Options
2. Enable USB Debugging

### Step 3: Connect & Run
```powershell
# Connect phone via USB
# Then run:
npx expo run:android
```

## Quick Fix: Generate Gradle Wrapper

If you want to use gradle directly:

```powershell
cd android

# Install Gradle (if not installed)
# Or use Android Studio's gradle

# Generate wrapper
gradle wrapper

# Then build
.\gradlew.bat assembleDebug
```

## Recommended Approach

**For immediate build without device:**

1. **Use EAS Build** (easiest, no setup):
   ```powershell
   npm install -g eas-cli
   eas login
   eas build:configure
   eas build --profile development --platform android
   ```

2. **Or use Expo Prebuild + Local Build**:
   ```powershell
   npx expo prebuild
   cd android
   .\gradlew.bat assembleDebug
   ```

## After Building APK

1. **Transfer to phone** (USB, email, cloud)
2. **Install manually**:
   - Open file manager
   - Tap APK file
   - Allow "Install from Unknown Sources"
   - Install

3. **For Expo dev server**:
   ```powershell
   npx expo start --dev-client
   # Scan QR code with installed app
   ```

