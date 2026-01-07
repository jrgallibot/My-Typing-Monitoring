# MyTypingMonitor - Expo Setup

## ⚠️ Important: Cannot Use Expo Go

This app **cannot run in Expo Go** because it uses custom native Android code:
- Custom IME keyboard service
- Room database
- WorkManager
- Custom native modules

## ✅ Solution: Development Builds

Use **Expo Development Builds** (expo-dev-client) instead.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Assets (Required)

You need these image files:
- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1242x2436)
- `assets/adaptive-icon.png` (1024x1024)

See `ASSETS_NEEDED.md` for details, or create simple placeholder images.

### 3. Build Development Build

```bash
# This builds and installs the app
npx expo run:android
```

**First time only**: Expo may run `prebuild` to configure native projects. This is normal.

### 4. Start Development Server

```bash
npx expo start --dev-client
```

### 5. Connect to Dev Server

1. Open the **development build app** on your device (the one you just installed)
2. Shake device to open dev menu
3. Tap "Scan QR Code"
4. Scan the QR code from terminal

**OR** manually enter the connection URL shown in terminal.

## Development Workflow

- **JavaScript changes**: Auto-reloads (Fast Refresh)
- **Native code changes**: Rebuild required (`npx expo run:android`)
- **Reload manually**: Shake device or press `r` in terminal

## What Changed

✅ Added Expo configuration
✅ Added expo-dev-client
✅ Updated entry point
✅ Updated Babel/Metro configs
✅ **All native code unchanged**
✅ **All functionality unchanged**

## Production Build

```bash
# Using EAS Build (cloud)
eas build --platform android --profile production

# Or local build (original method)
cd android
./gradlew assembleRelease
```

## Troubleshooting

### "Unable to resolve module expo"
```bash
npm install
npx expo start -c  # Clear cache
```

### "Development build not found"
- Make sure you ran `npx expo run:android` first
- Don't use Expo Go - use the development build you installed

### QR Code not working
- Device and computer must be on same WiFi
- Try: `npx expo start --tunnel`

### Assets missing
- Create placeholder images (see `ASSETS_NEEDED.md`)
- Or temporarily comment out asset paths in `app.json`

## Key Points

1. ✅ You can scan QR codes (with dev build installed)
2. ✅ All native code works (IME, Room, WorkManager)
3. ✅ Hot reload works for JavaScript
4. ❌ Cannot use standard Expo Go app
5. ✅ Must build development build first

## Summary

```bash
# Setup (one time)
npm install
npx expo run:android

# Development (every time)
npx expo start --dev-client
# Scan QR code with dev build app
```

That's it! You now have Expo workflow with full native functionality.

