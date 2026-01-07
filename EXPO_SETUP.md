# Expo Setup for MyTypingMonitor

## ⚠️ Important: Expo Go Limitation

**This app CANNOT run in Expo Go** because it uses custom native Android code:
- Custom IME keyboard service
- Room database
- WorkManager
- Custom native modules

## ✅ Solution: Development Builds

You need to use **Expo Development Builds** (expo-dev-client) instead of Expo Go.

## Setup Instructions

### 1. Install Expo CLI

```bash
npm install -g expo-cli
# or
npm install -g @expo/cli
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Development Build

#### Option A: Local Build (Recommended for Testing)

```bash
# Build Android development APK
npx expo run:android

# This will:
# - Build the app with expo-dev-client
# - Install on connected device/emulator
# - Start Metro bundler
```

#### Option B: EAS Build (Cloud Build)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Build development version:
```bash
eas build --profile development --platform android
```

5. Install the APK on your device from the build URL

### 4. Start Development Server

```bash
# Start Expo dev server
npx expo start --dev-client

# Or use the QR code (but you need dev build installed)
npx expo start
```

### 5. Connect to Development Build

1. Open the development build app on your device
2. Scan the QR code from the terminal
3. The app will reload with your code

## Development Workflow

1. **Make code changes** in `src/` directory
2. **Save files** - Metro will auto-reload
3. **Shake device** or press `r` in terminal to reload
4. **Native code changes** require rebuilding:
   ```bash
   npx expo run:android
   ```

## Building Production APK

### Using EAS Build

```bash
eas build --platform android --profile production
```

### Using Local Build

```bash
cd android
./gradlew assembleRelease
```

## Key Differences from Expo Go

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Custom Native Code | ❌ No | ✅ Yes |
| Custom IME Service | ❌ No | ✅ Yes |
| Room Database | ❌ No | ✅ Yes |
| WorkManager | ❌ No | ✅ Yes |
| QR Code Scan | ✅ Yes | ✅ Yes (with dev build) |
| Hot Reload | ✅ Yes | ✅ Yes |
| Fast Refresh | ✅ Yes | ✅ Yes |

## Troubleshooting

### "Unable to resolve module expo"
- Run `npm install` again
- Clear cache: `npx expo start -c`

### "Development build not found"
- Make sure you installed the development build APK
- Don't use Expo Go app

### "Native module not found"
- Rebuild the app: `npx expo run:android`
- Native code changes require rebuild

### QR Code not working
- Make sure device and computer are on same network
- Use tunnel mode: `npx expo start --tunnel`

## Project Structure (Expo)

```
MyTypingMonitor/
├── app.json              # Expo configuration
├── package.json          # Dependencies (now includes Expo)
├── babel.config.js       # Babel config (Expo preset)
├── metro.config.js       # Metro config (Expo)
├── android/              # Native Android code (unchanged)
│   └── app/src/main/...
└── src/                  # React Native code (unchanged)
    └── screens/...
```

## Notes

- All native Android code remains unchanged
- React Native code remains unchanged
- Only configuration files updated for Expo
- Development builds allow full native functionality
- Production builds work the same way

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build and run development build
npx expo run:android

# 3. In another terminal, start dev server
npx expo start --dev-client

# 4. Shake device to reload or press 'r' in terminal
```

The app will work exactly the same, but now you can use Expo's development tools and QR code scanning (with development build installed).

