# Quick Build Solution - No Device Needed!

## ✅ Easiest Option: EAS Build (Cloud)

You can build the APK in the cloud without needing a device or emulator:

```powershell
# 1. Make sure you're logged in
eas login

# 2. Configure EAS (first time only)
eas build:configure

# 3. Build development APK
eas build --profile development --platform android
```

**That's it!** The build runs in the cloud (5-10 minutes), then you get a download URL.

## Option 2: Connect Physical Device

### Step 1: Enable Developer Mode
1. On your Android phone: **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging
1. **Settings** → **Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB** (if available)

### Step 3: Connect & Run
```powershell
# Connect phone via USB
# Then run:
npx expo run:android
```

## Option 3: Android Emulator

### Step 1: Install Android Studio
1. Download: https://developer.android.com/studio
2. Install with default settings

### Step 2: Create Virtual Device
1. Open Android Studio
2. **Tools** → **Device Manager**
3. Click **Create Device**
4. Select device (e.g., Pixel 5)
5. Download system image (Android 13)
6. Click **Finish**

### Step 3: Start Emulator
1. In Device Manager, click **Play** button
2. Wait for emulator to boot

### Step 4: Run App
```powershell
npx expo run:android
```

## Recommended: Use EAS Build

**Why EAS Build is easiest:**
- ✅ No device needed
- ✅ No emulator needed
- ✅ No Android Studio needed
- ✅ No Java setup needed
- ✅ Works on any computer
- ✅ Free for development builds

**Just run:**
```powershell
eas build --profile development --platform android
```

Then download and install the APK on your phone!

