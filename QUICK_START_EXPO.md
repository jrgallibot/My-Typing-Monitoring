# Quick Start: Expo Development Build

## ⚠️ Cannot Use Expo Go

This app **cannot** run in the standard Expo Go app because it uses custom native Android code (IME keyboard, Room database, WorkManager).

## ✅ Use Development Build Instead

You can still use Expo's QR code scanning, but you need to install a **development build** first.

## Step-by-Step Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Assets (Required)

Create placeholder images or use existing ones:

```bash
mkdir -p assets
```

You need:
- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1242x2436)
- `assets/adaptive-icon.png` (1024x1024)

See `ASSETS_NEEDED.md` for details.

### 3. Build Development Build

```bash
# This builds and installs the app with expo-dev-client
npx expo run:android
```

This will:
- Build the app with all native code
- Install on your connected device/emulator
- Start Metro bundler

### 4. Start Development Server

In a new terminal:

```bash
npx expo start --dev-client
```

You'll see a QR code in the terminal.

### 5. Connect to Dev Server

**Option A: QR Code Scan**
1. Open the **development build app** on your device (not Expo Go!)
2. Shake device or open dev menu
3. Tap "Scan QR Code"
4. Scan the QR code from terminal

**Option B: Manual Connection**
1. Open the development build app
2. Shake device to open dev menu
3. Enter the connection URL manually

### 6. Development Workflow

- **JavaScript changes**: Auto-reloads (Fast Refresh)
- **Native code changes**: Rebuild required (`npx expo run:android`)
- **Reload manually**: Shake device or press `r` in terminal

## What Changed for Expo

✅ **Added**:
- `expo` and `expo-dev-client` packages
- Expo configuration in `app.json`
- Expo Babel preset
- Expo Metro config
- Expo entry point (`registerRootComponent`)

✅ **Unchanged**:
- All native Android code (IME, Room, WorkManager, etc.)
- All React Native UI code
- All functionality

## Troubleshooting

### "Unable to resolve module expo"
```bash
npm install
npx expo start -c  # Clear cache
```

### "Development build not found"
- Make sure you ran `npx expo run:android` first
- Don't use Expo Go app - use the development build

### QR Code not scanning
- Device and computer must be on same WiFi
- Try tunnel mode: `npx expo start --tunnel`

### Assets missing
- Create placeholder images (see `ASSETS_NEEDED.md`)
- Or temporarily comment out asset paths in `app.json`

## Production Build

For production APK:

```bash
# Using EAS Build (cloud)
eas build --platform android --profile production

# Or local build
cd android
./gradlew assembleRelease
```

## Key Points

1. ✅ You can use QR code scanning (with dev build installed)
2. ✅ All native code works (IME, Room, WorkManager)
3. ✅ Hot reload works for JavaScript
4. ❌ Cannot use standard Expo Go app
5. ✅ Must build development build first

## Summary

```bash
# 1. Install
npm install

# 2. Build dev build (one time, or when native code changes)
npx expo run:android

# 3. Start dev server (every time you develop)
npx expo start --dev-client

# 4. Scan QR code with the dev build app (not Expo Go!)
```

That's it! You now have Expo development workflow with full native functionality.

