# Build APK Without Device/Emulator

You can build the APK without connecting a device. Here's how:

## Quick Build (No Device Needed)

### Option 1: Build Release APK

```powershell
cd android
.\gradlew assembleRelease
```

APK location: `android\app\build\outputs\apk\release\app-release.apk`

### Option 2: Build Debug APK (Faster)

```powershell
cd android
.\gradlew assembleDebug
```

APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

## Install APK on Device

### Method 1: Transfer and Install Manually

1. **Copy APK to your phone**:
   - Via USB: Copy `app-debug.apk` to phone
   - Via email/cloud: Upload and download on phone

2. **Install on phone**:
   - Open file manager on phone
   - Tap the APK file
   - Allow "Install from Unknown Sources" if prompted
   - Tap Install

### Method 2: Install via ADB (If Available)

If you have ADB available later:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## For Expo Development Build

If you want to use Expo's QR code scanning later:

1. **Build development build APK**:
   ```powershell
   cd android
   .\gradlew assembleDebug
   ```

2. **Install on device** (manually or via ADB)

3. **Start Expo dev server**:
   ```powershell
   npx expo start --dev-client
   ```

4. **Scan QR code** with the installed app

## Setup ADB (Optional - For Future Use)

### Windows Setup

1. **Download Android Platform Tools**:
   - https://developer.android.com/studio/releases/platform-tools
   - Extract to a folder (e.g., `C:\platform-tools`)

2. **Add to PATH**:
   ```powershell
   # Temporary (current session)
   $env:Path += ";C:\platform-tools"
   
   # Permanent (PowerShell profile)
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\platform-tools", "User")
   ```

3. **Or install Android Studio** (includes ADB):
   - Download from https://developer.android.com/studio
   - Install (includes platform-tools)

### Verify ADB

```powershell
adb version
# Should show version number
```

## Current Solution: Build APK Now

Run this to build the APK:

```powershell
cd android
.\gradlew assembleDebug
```

Then transfer the APK to your phone and install it manually.

