# Android Device/Emulator Setup

## Error: No Android Device Found

If you see: `No Android connected device found, and no emulators could be started automatically`

You have 3 options:

## Option 1: Connect Physical Android Device (Recommended)

### Step 1: Enable Developer Options
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging
1. Go to **Settings** → **Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB** (if available)

### Step 3: Connect Device
1. Connect phone to computer via USB
2. On phone, tap **Allow USB Debugging** when prompted
3. Check connection:
   ```bash
   adb devices
   ```
   You should see your device listed

### Step 4: Run App
```bash
npx expo run:android
```

## Option 2: Use Android Emulator

### Step 1: Open Android Studio
1. Open **Android Studio**
2. Go to **Tools** → **Device Manager**
3. Click **Create Device**

### Step 2: Create Virtual Device
1. Select a device (e.g., Pixel 5)
2. Select a system image (e.g., Android 13)
3. Click **Finish**

### Step 3: Start Emulator
1. In Device Manager, click **Play** button next to your device
2. Wait for emulator to boot
3. Check connection:
   ```bash
   adb devices
   ```
   You should see `emulator-5554` or similar

### Step 4: Run App
```bash
npx expo run:android
```

## Option 3: Build APK Without Running (No Device Needed)

If you just want to build the APK without running it:

```bash
# Build release APK
cd android
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

Or with Expo:

```bash
# Build development APK
cd android
./gradlew assembleDebug

# APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

Then install manually:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

### "adb: command not found"
Install Android SDK Platform Tools:
- Windows: Download from https://developer.android.com/studio/releases/platform-tools
- Or install Android Studio (includes ADB)

Add to PATH:
```powershell
# Windows PowerShell
$env:Path += ";C:\Users\YourUser\AppData\Local\Android\Sdk\platform-tools"
```

### "Device unauthorized"
1. Disconnect and reconnect USB
2. On phone, tap **Allow USB Debugging**
3. Check "Always allow from this computer"

### Emulator won't start
1. Enable **Virtualization** in BIOS (Intel VT-x or AMD-V)
2. Check Android Studio → SDK Manager → SDK Tools
3. Make sure **Android Emulator** is installed

### "No emulators found"
1. Open Android Studio
2. Tools → Device Manager
3. Create a new virtual device
4. Make sure it's started before running command

## Quick Commands

```bash
# Check connected devices
adb devices

# List all devices (including offline)
adb devices -l

# Restart ADB server
adb kill-server
adb start-server

# Install APK manually
adb install path/to/app.apk

# Uninstall app
adb uninstall com.mytypingmonitor
```

## For QR Code Scanning (Expo)

Once you have a device/emulator:

1. **Build development build** (one time):
   ```bash
   npx expo run:android
   ```

2. **Start dev server**:
   ```bash
   npx expo start --dev-client
   ```

3. **Scan QR code** with the development build app on your device

## Alternative: Use EAS Build (Cloud)

If you don't want to set up local environment:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build in cloud (no device needed)
eas build --profile development --platform android
```

Then download and install the APK from the build URL.

