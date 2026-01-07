# Build APK Now - Quick Guide

## ✅ EAS CLI Already Installed!

You can build the APK right now using EAS Build (cloud). No Java or Android Studio needed!

## Step-by-Step

### 1. Login to Expo

```powershell
eas login
```

If you don't have an Expo account, it will prompt you to create one (free).

### 2. Configure EAS (First Time Only)

```powershell
eas build:configure
```

This creates an `eas.json` file with build configurations.

### 3. Build Development APK

```powershell
eas build --profile development --platform android
```

This will:
- Upload your project to Expo's servers
- Build the APK in the cloud
- Provide a download URL when complete (5-10 minutes)

### 4. Download and Install

1. Copy the download URL from the terminal
2. Open URL in browser on your phone (or computer)
3. Download the APK
4. Install on phone (allow "Install from Unknown Sources")

## Alternative: Build Release APK

For production:

```powershell
eas build --profile production --platform android
```

## After Installation

Once APK is installed on your device:

1. **Start Expo dev server**:
   ```powershell
   npx expo start --dev-client
   ```

2. **Scan QR code** with the installed app (not Expo Go!)

3. **App will reload** with your latest code

## Quick Commands

```powershell
# Login
eas login

# Configure (first time)
eas build:configure

# Build development APK
eas build --profile development --platform android

# Build production APK
eas build --profile production --platform android

# Check build status
eas build:list
```

## Troubleshooting

### "Not logged in"
```powershell
eas login
```

### "No project ID"
```powershell
eas build:configure
```

### Build fails
- Check the error message in terminal
- Make sure all dependencies are installed: `npm install`
- Try: `eas build --profile development --platform android --clear-cache`

## That's It!

Run these commands now:

```powershell
eas login
eas build:configure
eas build --profile development --platform android
```

Wait for build to complete, then download and install the APK!

